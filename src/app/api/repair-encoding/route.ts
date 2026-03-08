import { NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig } from '@/lib/site/store.server';
import { normalizeDeep } from '@/lib/text/normalize';

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
  const after = normalizeDeep(before);

  // Always write back (the whole point of this endpoint).
  await saveSiteConfig(after);

  return NextResponse.json({
    ok: true,
    changed: JSON.stringify(before) !== JSON.stringify(after)
  });
}
