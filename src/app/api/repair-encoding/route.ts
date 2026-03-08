import { NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig } from '@/lib/site/store.server';
import { DEFAULT_SITE_CONFIG } from '@/lib/site/defaultConfig';
import { repairDeepWithFallback, type RepairStats } from '@/lib/text/repair';

export const dynamic = 'force-dynamic';

function expectedToken() {
  return process.env.AICAR_REPAIR_TOKEN || process.env.AICAR_BOOTSTRAP_TOKEN || '';
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const expected = expectedToken();
  const provided = url.searchParams.get('t') || '';

  if (!expected || provided !== expected) {
    return NextResponse.json(
      {
        ok: false,
        error: 'forbidden',
        hint: 'Set AICAR_REPAIR_TOKEN (or keep AICAR_BOOTSTRAP_TOKEN) and call /api/repair-encoding?t=...'
      },
      { status: 403 }
    );
  }

  const before = await getSiteConfig();
  const stats: RepairStats = { scannedStrings: 0, fixedStrings: 0, fallbackStrings: 0 };
  const after = repairDeepWithFallback(before, DEFAULT_SITE_CONFIG, stats);

  // Always write back (the whole point of this endpoint).
  await saveSiteConfig(after as any);

  return NextResponse.json({
    ok: true,
    changed: JSON.stringify(before) !== JSON.stringify(after),
    stats
  });
}
