import { NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig } from '@/lib/site/store.server';
import { SiteConfig } from '@/lib/site/types';
import { getSession } from '@/lib/auth/session.server';
import { findUserByEmail, findUserById, rolePermissions } from '@/lib/auth/store.server';
import { PERM_ADMIN_ACCESS, PERM_ALL, ROLE_SUPER_ADMIN } from '@/lib/auth/constants';

export const dynamic = 'force-dynamic';

async function canWriteSiteConfig() {
  const session = await getSession();
  if (!session) return { ok: false as const, session: null };

  const hasDirect =
    session.roleIds?.includes(ROLE_SUPER_ADMIN) ||
    session.permissions?.includes(PERM_ALL) ||
    session.permissions?.includes('site:write') ||
    session.permissions?.includes(PERM_ADMIN_ACCESS) ||
    session.permissions?.includes('roles:manage') ||
    session.permissions?.includes('users:manage');

  if (hasDirect) {
    return { ok: true as const, session };
  }

  const user = (session.uid ? await findUserById(session.uid) : null) ?? (session.email ? await findUserByEmail(session.email) : null);
  if (!user || !user.isActive) {
    return { ok: false as const, session };
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

  return { ok, session, dbRoleIds: user.roleIds || [], dbPermissions: Array.from(perms) };
}

export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const auth = await canWriteSiteConfig();
  if (!auth.ok) {
    return NextResponse.json(
      {
        error: 'forbidden',
        requiredAny: ['site:write', PERM_ADMIN_ACCESS, 'roles:manage', 'users:manage', `role:${ROLE_SUPER_ADMIN}`],
        actualRoleIds: auth.session?.roleIds || [],
        actualPermissions: auth.session?.permissions || [],
        dbRoleIds: (auth as any).dbRoleIds || [],
        dbPermissions: (auth as any).dbPermissions || []
      },
      { status: 403 }
    );
  }

  const body = (await req.json()) as SiteConfig;
  if (!body || typeof body !== 'object' || !Array.isArray((body as any).pages)) {
    return NextResponse.json({ error: 'Invalid config' }, { status: 400 });
  }

  await saveSiteConfig(body);
  return NextResponse.json({ ok: true });
}
