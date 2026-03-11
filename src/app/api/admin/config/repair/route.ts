import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig } from '@/lib/site/store.server';
import { DEFAULT_SITE_CONFIG } from '@/lib/site/defaultConfig';
import { repairDeepWithFallback } from '@/lib/text/repair';
import { getSession } from '@/lib/auth/session.server';
import { findUserByEmail, findUserById, rolePermissions } from '@/lib/auth/store.server';
import { PERM_ADMIN_ACCESS, PERM_ALL, ROLE_SUPER_ADMIN } from '@/lib/auth/constants';

export const dynamic = 'force-dynamic';

async function canRunRepair(req: NextRequest) {
  const url = new URL(req.url);
  const token = (url.searchParams.get('t') || '').trim();
  const expected = (process.env.AICAR_BOOTSTRAP_TOKEN || '').trim();

  if (token && expected && token === expected) {
    return { ok: true as const, mode: 'token' as const };
  }

  const session = await getSession();
  if (!session) {
    return { ok: false as const, reason: 'no_session_or_invalid_token' };
  }

  const hasDirect =
    session.roleIds?.includes(ROLE_SUPER_ADMIN) ||
    session.permissions?.includes(PERM_ALL) ||
    session.permissions?.includes('site:write') ||
    session.permissions?.includes(PERM_ADMIN_ACCESS) ||
    session.permissions?.includes('roles:manage') ||
    session.permissions?.includes('users:manage');

  if (hasDirect) {
    return { ok: true as const, mode: 'session' as const };
  }

  const user =
    (session.uid ? await findUserById(session.uid) : null) ??
    (session.email ? await findUserByEmail(session.email) : null);

  if (!user || !user.isActive) {
    return { ok: false as const, reason: 'user_not_found_or_inactive' };
  }

  const perms = new Set(await rolePermissions(user.roleIds || []));
  if (user.roleIds?.includes(ROLE_SUPER_ADMIN)) {
    perms.add(PERM_ALL);
    perms.add(PERM_ADMIN_ACCESS);
    perms.add('site:write');
    perms.add('roles:manage');
    perms.add('users:manage');
  }

  const ok =
    perms.has(PERM_ALL) ||
    perms.has('site:write') ||
    perms.has(PERM_ADMIN_ACCESS) ||
    perms.has('roles:manage') ||
    perms.has('users:manage');

  if (!ok) {
    return {
      ok: false as const,
      reason: 'insufficient_permissions',
      roleIds: user.roleIds || [],
      permissions: Array.from(perms)
    };
  }

  return { ok: true as const, mode: 'session' as const };
}

export async function GET(req: NextRequest) {
  const auth = await canRunRepair(req);
  if (!auth.ok) {
    return NextResponse.json(
      {
        error: 'unauthorized',
        reason: (auth as any).reason || 'unauthorized',
        roleIds: (auth as any).roleIds || [],
        permissions: (auth as any).permissions || []
      },
      { status: 401 }
    );
  }

  const current = await getSiteConfig();
  const stats = { scannedStrings: 0, fixedStrings: 0, fallbackStrings: 0 };
  const repaired = repairDeepWithFallback(current, DEFAULT_SITE_CONFIG, stats);

  await saveSiteConfig(repaired);

  return NextResponse.json({
    ok: true,
    mode: auth.mode,
    stats
  });
}