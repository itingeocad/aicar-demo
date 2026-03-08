/**
 * Robust mojibake repair utilities.
 *
 * In demo content (Upstash JSON + admin-entered strings) we occasionally see:
 *  - UTF‑8 bytes decoded as CP1251 => "РђРІС‚Рѕ"
 *  - UTF‑8 bytes decoded as Latin1/Win-1252 => "ÐÐ²Ñ‚Ð¾"
 *  - Double CP1251 decode (UTF‑8 -> CP1251 -> UTF‑8 -> CP1251) which produces
 *    strings with NBSP and "вЂ..." fragments.
 *
 * This module repairs such strings conservatively and supports multiple passes.
 */

function isCyrillic(cp: number) {
  return (cp >= 0x0400 && cp <= 0x04ff) || (cp >= 0x0500 && cp <= 0x052f);
}

function countMatches(s: string, re: RegExp) {
  const m = s.match(re);
  return m ? m.length : 0;
}

function markerScore(s: string) {
  // Higher means "more broken".
  const rs = countMatches(s, /[РС]/g);
  const dn = countMatches(s, /[ÐÑ]/g);
  const vd = countMatches(s, /вЂ/g);
  const repl = countMatches(s, /\uFFFD/g);
  return rs + dn + vd * 2 + repl * 5;
}

function cyrCount(s: string) {
  let n = 0;
  for (const ch of s) if (isCyrillic(ch.codePointAt(0) ?? 0)) n += 1;
  return n;
}

function looksSuspicious(s: string) {
  if (!s) return false;
  // Fast checks for common mojibake markers.
  if (/[ÐÑ]/.test(s)) return true;
  if (/вЂ/.test(s)) return true;
  const rs = countMatches(s, /[РС]/g);
  // In CP1251 mojibake the ratio of Р/С is noticeably high.
  if (rs >= 3 && rs / Math.max(1, s.length) >= 0.12) return true;
  // Double-encoded strings often contain NBSP very frequently.
  const nbsp = countMatches(s, /\u00A0/g);
  if (nbsp >= 4 && nbsp / Math.max(1, s.length) >= 0.05) return true;
  return false;
}

// ---------- CP1251 mapping (bytes -> unicode) ----------
const CP1251_TABLE: number[] = [
  0x0402, 0x0403, 0x201a, 0x0453, 0x201e, 0x2026, 0x2020, 0x2021,
  0x20ac, 0x2030, 0x0409, 0x2039, 0x040a, 0x040c, 0x040b, 0x040f,
  0x0452, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x02dc, 0x2122, 0x0459, 0x203a, 0x045a, 0x045c, 0x045b, 0x045f,
  0x00a0, 0x040e, 0x045e, 0x0408, 0x00a4, 0x0490, 0x00a6, 0x00a7,
  0x0401, 0x00a9, 0x0404, 0x00ab, 0x00ac, 0x00ad, 0x00ae, 0x0407,
  0x00b0, 0x00b1, 0x0406, 0x0456, 0x0491, 0x00b5, 0x00b6, 0x00b7,
  0x0451, 0x2116, 0x0454, 0x00bb, 0x0458, 0x0405, 0x0455, 0x0457,
  0x0410, 0x0411, 0x0412, 0x0413, 0x0414, 0x0415, 0x0416, 0x0417,
  0x0418, 0x0419, 0x041a, 0x041b, 0x041c, 0x041d, 0x041e, 0x041f,
  0x0420, 0x0421, 0x0422, 0x0423, 0x0424, 0x0425, 0x0426, 0x0427,
  0x0428, 0x0429, 0x042a, 0x042b, 0x042c, 0x042d, 0x042e, 0x042f,
  0x0430, 0x0431, 0x0432, 0x0433, 0x0434, 0x0435, 0x0436, 0x0437,
  0x0438, 0x0439, 0x043a, 0x043b, 0x043c, 0x043d, 0x043e, 0x043f,
  0x0440, 0x0441, 0x0442, 0x0443, 0x0444, 0x0445, 0x0446, 0x0447,
  0x0448, 0x0449, 0x044a, 0x044b, 0x044c, 0x044d, 0x044e, 0x044f
];

const CP1251_INV: Map<number, number> = (() => {
  const m = new Map<number, number>();
  for (let i = 0; i < 0x80; i += 1) m.set(i, i); // ASCII
  for (let i = 0; i < CP1251_TABLE.length; i += 1) {
    m.set(CP1251_TABLE[i], 0x80 + i);
  }
  return m;
})();

function encodeCp1251BytesLossless(s: string): Uint8Array | null {
  const out: number[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;

    // Drop replacement characters introduced by previous decode attempts.
    if (cp === 0xfffd) continue;

    // IMPORTANT: allow raw byte codepoints (0x80..0xFF).
    // In double-encoded strings you can get C1 controls like U+0098.
    if (cp <= 0xff) {
      out.push(cp);
      continue;
    }

    const b = CP1251_INV.get(cp);
    if (b === undefined) return null;
    out.push(b);
  }
  return new Uint8Array(out);
}

const UTF8_DECODER = new TextDecoder('utf-8', { fatal: false });

function decodeUtf8(bytes: Uint8Array) {
  return UTF8_DECODER.decode(bytes);
}

function tryFixCp1251(s: string): string | null {
  const rs = countMatches(s, /[РС]/g);
  if (rs < 2 && !/вЂ/.test(s) && !/\u00A0/.test(s)) return null;

  const bytes = encodeCp1251BytesLossless(s);
  if (!bytes) return null;

  const out = decodeUtf8(bytes);
  return out;
}

function tryFixLatin1(s: string): string | null {
  // Only safe if every codepoint fits into a byte.
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp > 0xff && cp !== 0xfffd) return null;
  }

  const bytes = new Uint8Array([...s].map((c) => (c.charCodeAt(0) & 0xff)));
  return decodeUtf8(bytes);
}

function cleanupArtifacts(s: string): string {
  return s
    // Strip BOM if it sneaks into stored JSON strings
    .replace(/\uFEFF/g, '')
    // Common cp1251 artifacts for punctuation/bullets
    .replace(/вЂў/g, '•')
    .replace(/вЂ“/g, '–')
    .replace(/вЂ”/g, '—')
    .replace(/вЂ™/g, '’')
    .replace(/вЂ˜/g, '‘')
    .replace(/вЂњ/g, '“')
    .replace(/вЂќ/g, '”')
    // NBSP normalization (safe for our UI)
    .replace(/\u00A0/g, ' ')
    // Some double-encoding leaves a literal "Â" before spaces.
    .replace(/Â /g, ' ')
    .replace(/Â\s/g, ' ')
    // Remove any remaining replacement chars.
    .replace(/\uFFFD/g, '');
}

function bestCandidate(cur: string, candidates: string[]): string {
  const curScore = markerScore(cur);
  const curCyr = cyrCount(cur);

  let best = cur;
  let bestScore = curScore;
  let bestCyr = curCyr;

  for (const raw of candidates) {
    const cand = cleanupArtifacts(raw);
    const sc = markerScore(cand);
    const cyr = cyrCount(cand);

    // Prefer strictly fewer markers.
    if (sc < bestScore) {
      best = cand;
      bestScore = sc;
      bestCyr = cyr;
      continue;
    }

    // If markers equal, prefer more Cyrillic.
    if (sc === bestScore && cyr > bestCyr) {
      best = cand;
      bestCyr = cyr;
    }
  }

  // Don't accept a candidate that loses most Cyrillic unless it also removes lots of markers.
  if (best !== cur) {
    const gain = curScore - bestScore;
    if (bestCyr === 0 && curCyr > 0) return cur;
    if (bestCyr < curCyr / 2 && gain < 5) return cur;
  }

  return best;
}

export function fixMojibake(input: string): string {
  if (!input) return input;

  let cur = input;

  // Up to 4 passes to handle double-encoding.
  for (let pass = 0; pass < 4; pass += 1) {
    if (!looksSuspicious(cur)) break;

    const candidates: string[] = [];
    const cp = tryFixCp1251(cur);
    if (cp) candidates.push(cp);

    const l1 = tryFixLatin1(cur);
    if (l1) candidates.push(l1);

    if (candidates.length === 0) break;

    const next = bestCandidate(cur, candidates);
    if (next === cur) break;
    cur = next;
  }

  return cleanupArtifacts(cur);
}

export function normalizeDeep<T>(val: T): T {
  if (val === null || val === undefined) return val;

  if (typeof val === 'string') return fixMojibake(val) as any;

  if (Array.isArray(val)) {
    return val.map((v) => normalizeDeep(v)) as any;
  }

  if (typeof val === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(val as any)) {
      out[k] = normalizeDeep(v);
    }
    return out;
  }

  return val;
}
