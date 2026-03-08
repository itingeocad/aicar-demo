import { NextResponse } from 'next/server';

import { DEFAULT_SITE_CONFIG } from '@/lib/site/defaultConfig';
import { getSiteConfig, saveSiteConfig } from '@/lib/site/store.server';
import { repairDeepWithFallback, type RepairStats } from '@/lib/text/repair';

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

  const current = await getSiteConfig();
  const stats: RepairStats = { scannedStrings: 0, fixedStrings: 0, fallbackStrings: 0 };
  const repaired = repairDeepWithFallback(current, DEFAULT_SITE_CONFIG, stats);

  await saveSiteConfig(repaired as any);

  return NextResponse.json({ ok: true, action: 'repair', stats });
}

export async function POST(req: Request) {
  return GET(req);
}
