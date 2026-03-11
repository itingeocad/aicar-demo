import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig } from '@/lib/site/store.server';
import { DEFAULT_SITE_CONFIG } from '@/lib/site/defaultConfig';
import { getSession } from '@/lib/auth/session.server';

export const dynamic = 'force-dynamic';

type Stats = {
  scannedStrings: number;
  fixedStrings: number;
};

function isRecord(x: unknown): x is Record<string, any> {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}

function hasIdArray(arr: unknown[]): boolean {
  return arr.some((x) => isRecord(x) && typeof x.id === 'string');
}

function indexById(arr: unknown[]): Map<string, any> {
  const m = new Map<string, any>();
  for (const item of arr) {
    if (isRecord(item) && typeof item.id === 'string') {
      m.set(item.id, item);
    }
  }
  return m;
}

function clean(s: string): string {
  return s.replace(/\uFEFF/g, '').replace(/\u00A0/g, ' ');
}

function tryRepairFromFallback(current: string, fallback?: string): string {
  if (typeof fallback !== 'string' || !fallback) return current;

  const cur = clean(current).trimStart();
  const fb = clean(fallback).trimStart();

  if (!cur || !fb || fb.length < 2) return current;

  const tail = fb.slice(1);

  if (cur === tail) return fb;
  if (cur.toLowerCase() === tail.toLowerCase()) return fb;

  return current;
}

function repairDeep(current: any, fallback: any, stats: Stats): any {
  if (current === null || current === undefined) return current;

  if (typeof current === 'string') {
    stats.scannedStrings += 1;
    const repaired = tryRepairFromFallback(current, typeof fallback === 'string' ? fallback : undefined);
    if (repaired !== current) stats.fixedStrings += 1;
    return repaired;
  }

  if (Array.isArray(current)) {
    const fbArr = Array.isArray(fallback) ? fallback : [];

    if (hasIdArray(current) && hasIdArray(fbArr)) {
      const byId = indexById(fbArr);
      return current.map((item) => {
        if (isRecord(item) && typeof item.id === 'string') {
          return repairDeep(item, byId.get(item.id), stats);
        }
        return repairDeep(item, undefined, stats);
      });
    }

    return current.map((item, idx) => repairDeep(item, fbArr[idx], stats));
  }

  if (isRecord(current)) {
    const out: Record<string, any> = {};
    const fbRec = isRecord(fallback) ? fallback : {};
    for (const [k, v] of Object.entries(current)) {
      out[k] = repairDeep(v, fbRec[k], stats);
    }
    return out;
  }

  return current;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  const token = (new URL(req.url).searchParams.get('t') || '').trim();
  const expected = (process.env.AICAR_BOOTSTRAP_TOKEN || '').trim();

  if (!session && !(token && expected && token === expected)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const current = await getSiteConfig();
  const stats: Stats = { scannedStrings: 0, fixedStrings: 0 };
  const repaired = repairDeep(current, DEFAULT_SITE_CONFIG, stats);

  await saveSiteConfig(repaired);

  return NextResponse.json({
    ok: true,
    mode: session ? 'session' : 'token',
    stats
  });
}