import { NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig } from '@/lib/site/store.server';
import { SiteConfig } from '@/lib/site/types';
import { getSession, hasAnyPermission } from '@/lib/auth/session.server';
import { PERM_ADMIN_ACCESS, PERM_ALL, ROLE_SUPER_ADMIN } from '@/lib/auth/constants';

export const dynamic = 'force-dynamic';

function canWriteSiteConfig(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session) return false;
  if (session.roleIds?.includes(ROLE_SUPER_ADMIN)) return true;
  if (session.permissions?.includes(PERM_ALL)) return true;
  return hasAnyPermission(session, ['site:write', PERM_ADMIN_ACCESS]);
}

export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!canWriteSiteConfig(session)) {
    return NextResponse.json(
      { error: 'forbidden', requiredAny: ['site:write', PERM_ADMIN_ACCESS, `role:${ROLE_SUPER_ADMIN}`] },
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
