import { NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig } from '@/lib/site/store.server';
import { SiteConfig } from '@/lib/site/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const body = (await req.json()) as SiteConfig;
  // Minimal validation for demo.
  if (!body || typeof body !== 'object' || !Array.isArray((body as any).pages)) {
    return NextResponse.json({ error: 'Invalid config' }, { status: 400 });
  }

  await saveSiteConfig(body);
  return NextResponse.json({ ok: true });
}
