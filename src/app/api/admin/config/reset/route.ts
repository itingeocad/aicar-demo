import { NextResponse } from 'next/server';

import { DEFAULT_SITE_CONFIG } from '@/lib/site/defaultConfig';
import { saveSiteConfig } from '@/lib/site/store.server';

function requireToken(req: Request): string | null {
  const expected = process.env.AICAR_BOOTSTRAP_TOKEN || '';
  const url = new URL(req.url);
  const t = url.searchParams.get('t') || '';
  if (!expected || t !== expected) return null;
  return t;
}

export async function GET(req: Request) {
  if (!requireToken(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // Hard reset to defaults.
  await saveSiteConfig(DEFAULT_SITE_CONFIG);
  return NextResponse.json({ ok: true, action: 'reset', version: DEFAULT_SITE_CONFIG.version });
}

export async function POST(req: Request) {
  return GET(req);
}
