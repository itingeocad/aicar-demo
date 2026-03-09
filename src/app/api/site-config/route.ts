import { NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig } from '@/lib/site/store.server';
import { normalizeDeep } from '@/lib/text/normalize';
import { SiteConfig } from '@/lib/site/types';
import { getSession, hasPermission } from '@/lib/auth/session.server';
import { PERM_ADMIN_ACCESS } from '@/lib/auth/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = normalizeDeep(await getSiteConfig());
  return NextResponse.json(config, {
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

export async function PUT(req: Request) {
  const session = await getSession();
  const canWriteSite = hasPermission(session, 'site:write') || hasPermission(session, PERM_ADMIN_ACCESS);
  if (!canWriteSite) {
    return NextResponse.json(
      { error: 'forbidden', requiredAny: ['site:write', PERM_ADMIN_ACCESS] },
      { status: 403 }
    );
  }

  const body = (await req.json()) as SiteConfig;
  // Minimal validation for demo.
  if (!body || typeof body !== 'object' || !Array.isArray((body as any).pages)) {
    return NextResponse.json({ error: 'Invalid config' }, { status: 400 });
  }

  await saveSiteConfig(body);
  return NextResponse.json({ ok: true });
}
