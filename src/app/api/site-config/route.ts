import { NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig } from '@/lib/site/store.server';
import type { SiteConfig } from '@/lib/site/types';
import { getSession } from '@/lib/auth/session.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Нужно войти в админку.' },
      { status: 401 }
    );
  }

  const body = (await req.json()) as SiteConfig;
  if (!body || typeof body !== 'object' || !Array.isArray((body as any).pages)) {
    return NextResponse.json({ error: 'invalid_config' }, { status: 400 });
  }

  await saveSiteConfig(body);
  return NextResponse.json({ ok: true });
}