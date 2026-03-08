/**
 * Fixes mojibake caused by decoding UTF‑8 bytes as CP1251 or ISO‑8859‑1/Windows-1252.
 *
 * Examples:
 *   "Р‘Р°РЅРµСЂ"  -> "Банер"
 *   "РђРІС‚Рѕ"    -> "Авто"
 *   "ÐÐ²Ñ‚Ð¾"   -> "Авто"
 *
 * NOTE:
 * - This runs on content loaded from storage (Upstash / local JSON).
 * - We keep it conservative to avoid touching already-correct strings.
 */

function isCyrillicCodePoint(cp: number) {
  return (cp >= 0x0400 && cp <= 0x04ff) || (cp >= 0x0500 && cp <= 0x052f);
}

function countCyrillic(s: string) {
  let n = 0;
  for (const ch of s) {
    if (isCyrillicCodePoint(ch.codePointAt(0) ?? 0)) n += 1;
  }
  return n;
}

function countMatches(s: string, re: RegExp) {
  return (s.match(re) ?? []).length;
}

function rsRatio(s: string) {
  const rs = countMatches(s, /[РС]/g);
  return s.length ? rs / s.length : 0;
}

function markerScore(s: string) {
  // Strong markers of mojibake.
  const latin = countMatches(s, /[ÐÑÂâ]/g);
  const cp1 = countMatches(s, /[ЂЃЉЊЎўќџ]/g);
  const quotes = countMatches(s, /[‘’“”‚„…†‡•–—™‹›]/g);
  const vd = countMatches(s, /вЂ/g);
  const rs = countMatches(s, /[РС]/g);
  return latin * 3 + cp1 * 3 + quotes * 2 + vd * 4 + (rsRatio(s) > 0.22 ? rs : 0);
}

function looksSuspicious(s: string) {
  if (!s || s.length < 3) return false;
  if (/[ÐÑÂâ]/.test(s)) return true; // latin1 mojibake
  if (/вЂ/.test(s)) return true; // bullets/quotes rendered as "вЂ..."
  if (/[ЂЃЉЊЎўќџ]/.test(s)) return true; // cp1251 special letters
  // CP1251-mojibake often has very high density of 'Р'/'С'
  if ((s.includes('Р') || s.includes('С')) && rsRatio(s) >= 0.22) return true;
  return false;
}

// Full CP1251 byte->Unicode table for 0x80..0xFF
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

const CP1251_INV = new Map<number, number>();
for (let b = 0; b < 0x80; b += 1) CP1251_INV.set(b, b);
for (let i = 0; i < CP1251_TABLE.length; i += 1) CP1251_INV.set(CP1251_TABLE[i]!, 0x80 + i);

function encodeCp1251(s: string): Uint8Array | null {
  const bytes: number[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    const b = CP1251_INV.get(cp);
    if (b === undefined) return null;
    bytes.push(b);
  }
  return new Uint8Array(bytes);
}

function decodeUtf8(bytes: Uint8Array): string {
  // Buffer is available in Node runtime (Vercel).
  // eslint-disable-next-line no-undef
  return Buffer.from(bytes).toString('utf8');
}

function tryFixCp1251(s: string): string | null {
  const bytes = encodeCp1251(s);
  if (!bytes) return null;
  const out = decodeUtf8(bytes);
  if (!out) return null;
  if (out.includes('�')) return null;
  return out;
}

function tryFixLatin1(s: string): string | null {
  // eslint-disable-next-line no-undef
  const out = Buffer.from(s, 'latin1').toString('utf8');
  if (!out) return null;
  if (out.includes('�')) return null;
  return out;
}

function betterCandidate(orig: string, cand: string) {
  // Must reduce markers meaningfully.
  const m0 = markerScore(orig);
  const m1 = markerScore(cand);
  if (m1 >= m0) return false;

  // Candidate should look like real text: more (or at least not fewer) Cyrillic when original already had some.
  const c0 = countCyrillic(orig);
  const c1 = countCyrillic(cand);
  if (c0 >= 2 && c1 < Math.floor(c0 / 2)) return false;

  // Avoid pathological results that become mostly control/whitespace.
  if (cand.trim().length === 0) return false;

  return true;
}

export function fixMojibake(s: string) {
  let cur = s;

  // Allow up to 3 passes (handles rare double / triple encodings).
  for (let i = 0; i < 3; i += 1) {
    if (!looksSuspicious(cur)) return cur;

    const candidates: string[] = [];

    const cp = tryFixCp1251(cur);
    if (cp) candidates.push(cp);

    const latin = tryFixLatin1(cur);
    if (latin) candidates.push(latin);

    if (candidates.length === 0) return cur;

    // Pick the best candidate (lowest marker score; tie-breaker: more Cyrillic).
    let best = cur;
    let bestM = markerScore(cur);
    let bestC = countCyrillic(cur);

    for (const c of candidates) {
      const m = markerScore(c);
      const cy = countCyrillic(c);
      if (m < bestM || (m === bestM && cy > bestC)) {
        best = c;
        bestM = m;
        bestC = cy;
      }
    }

    if (best === cur) return cur;
    if (!betterCandidate(cur, best)) return cur;

    cur = best;
  }

  return cur;
}

export function normalizeDeep<T>(val: T): T {
  if (typeof val === 'string') return fixMojibake(val) as unknown as T;
  if (Array.isArray(val)) return val.map((v) => normalizeDeep(v)) as unknown as T;
  if (val && typeof val === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(val as any)) {
      out[k] = normalizeDeep(v);
    }
    return out as T;
  }
  return val;
}
