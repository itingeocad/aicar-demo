/**
 * Encoding repair utilities.
 *
 * We see two recurring corruptions in stored content:
 *  1) UTF‑8 bytes decoded as CP1251 => "РђРІС‚Рѕ"
 *  2) UTF‑8 bytes decoded as Latin1/Windows-1252 => "ÐÐ²Ñ‚Ð¾"
 *
 * This module attempts to repair such strings conservatively.
 */

function isCyrillic(cp: number) {
  return (cp >= 0x0400 && cp <= 0x04ff) || (cp >= 0x0500 && cp <= 0x052f);
}

function countMatches(s: string, re: RegExp) {
  const m = s.match(re);
  return m ? m.length : 0;
}

function ratio(n: number, d: number) {
  return d <= 0 ? 0 : n / d;
}

// ---------- CP1251 encode (unicode -> bytes) ----------
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

const CP1251_ENC: Map<number, number> = (() => {
  const m = new Map<number, number>();
  for (let i = 0; i < CP1251_TABLE.length; i += 1) m.set(CP1251_TABLE[i], 0x80 + i);
  return m;
})();

function encodeCp1251(s: string): Uint8Array | null {
  const out: number[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp <= 0x7f) {
      out.push(cp);
      continue;
    }
    const b = CP1251_ENC.get(cp);
    if (b === undefined) return null;
    out.push(b);
  }
  return new Uint8Array(out);
}

function decodeUtf8(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function tryFixCp1251Mojibake(s: string): string | null {
  // A conservative trigger: mojibake typically has many "Р"/"С" characters.
  const rs = countMatches(s, /[РС]/g);
  if (rs < 3 || ratio(rs, s.length) < 0.15) return null;

  const bytes = encodeCp1251(s);
  if (!bytes) return null;

  const out = decodeUtf8(bytes);
  if (!out) return null;

  // Must improve: fewer mojibake markers, more "real" Cyrillic.
  const outRs = countMatches(out, /[РСÐÑ]/g);
  const outCyr = (() => {
    let n = 0;
    for (const ch of out) if (isCyrillic(ch.codePointAt(0) ?? 0)) n += 1;
    return n;
  })();

  if (outCyr === 0) return null;
  if (outRs > rs) return null;
  return out;
}

function tryFixLatin1Mojibake(s: string): string | null {
  // Latin1 mojibake for Cyrillic usually has lots of Ð/Ñ.
  const dn = countMatches(s, /[ÐÑ]/g);
  if (dn < 2 || ratio(dn, s.length) < 0.08) return null;

  const bytes = new Uint8Array([...s].map((c) => c.charCodeAt(0) & 0xff));
  const out = decodeUtf8(bytes);
  if (!out) return null;

  let outCyr = 0;
  for (const ch of out) if (isCyrillic(ch.codePointAt(0) ?? 0)) outCyr += 1;
  if (outCyr === 0) return null;
  return out;
}

export function fixMojibake(input: string): string {
  if (!input) return input;

  // Fast path: if no typical markers, do nothing.
  const hasMarkers =
    /[ÐÑ]/.test(input) ||
    ((input.includes('Р') || input.includes('С')) && ratio(countMatches(input, /[РС]/g), input.length) >= 0.15) ||
    /вЂ/.test(input); // bullets, quotes, etc.

  if (!hasMarkers) return input;

  // Allow up to 2 passes (rare double-encoding).
  let cur = input;
  for (let i = 0; i < 2; i += 1) {
    const fixed =
      tryFixCp1251Mojibake(cur) ??
      tryFixLatin1Mojibake(cur);

    if (!fixed || fixed === cur) break;
    cur = fixed;
  }

  // Fix common “вЂў” / “вЂ” artifacts that may remain after partial repair.
  cur = cur
    .replace(/вЂў/g, '•')
    .replace(/вЂ“/g, '–')
    .replace(/вЂ”/g, '—')
    .replace(/вЂ™/g, '’')
    .replace(/вЂњ/g, '“')
    .replace(/вЂќ/g, '”')
    .replace(/Â /g, ' ');

  return cur;
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
      // We generally don't want to rewrite keys, but sometimes stored configs contain mojibake keys
      // (rare). Fix keys only if they clearly look broken.
      const fixedKey = fixMojibake(k);
      out[fixedKey] = normalizeDeep(v);
    }
    return out;
  }

  return val;
}
