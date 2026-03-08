/**
 * Fixes common mojibake where UTF-8 bytes were decoded as CP1251,
 * producing strings like "Р‘Р°РЅРµСЂ" instead of "Банер".
 *
 * This is a pragmatic helper for demo/admin content.
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

function looksLikeCp1251Mojibake(s: string) {
  // Heuristic: many "Р" and "С" letters appear when UTF-8 bytes are mis-decoded as CP1251.
  const score = (s.match(/[РС]/g) ?? []).length;
  return score >= 3 && s.length >= 6;
}

function cp1251CharToByte(cp: number): number | null {
  // Fast-path ASCII
  if (cp >= 0x00 && cp <= 0x7f) return cp;

  // Latin-1 range
  if (cp >= 0x00a0 && cp <= 0x00ff) return cp;

  // Cyrillic А-я
  if (cp >= 0x0410 && cp <= 0x042f) return 0xc0 + (cp - 0x0410);
  if (cp >= 0x0430 && cp <= 0x044f) return 0xe0 + (cp - 0x0430);

  // Ё/ё
  if (cp === 0x0401) return 0xa8;
  if (cp === 0x0451) return 0xb8;

  // A few punctuation commonly present in mojibake strings
  const map: Record<number, number> = {
    0x201a: 0x82,
    0x0192: 0x83,
    0x201e: 0x84,
    0x2026: 0x85,
    0x2020: 0x86,
    0x2021: 0x87,
    0x02c6: 0x88,
    0x2030: 0x89,
    0x0160: 0x8a,
    0x2039: 0x8b,
    0x0152: 0x8c,
    0x017d: 0x8e,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201c: 0x93,
    0x201d: 0x94,
    0x2022: 0x95,
    0x2013: 0x96,
    0x2014: 0x97,
    0x2122: 0x99,
    0x0161: 0x9a,
    0x203a: 0x9b,
    0x0153: 0x9c,
    0x017e: 0x9e,
    0x0178: 0x9f
  };

  return map[cp] ?? null;
}

export function fixMojibake(s: string) {
  if (!s) return s;
  if (!looksLikeCp1251Mojibake(s)) return s;

  const bytes: number[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    const b = cp1251CharToByte(cp);
    if (b === null) return s;
    bytes.push(b);
  }

  try {
    const dec = new TextDecoder('utf-8', { fatal: false });
    const out = dec.decode(new Uint8Array(bytes));

    // If output became more Cyrillic and less mojibake-like, accept it.
    if (out && !looksLikeCp1251Mojibake(out) && countCyrillic(out) >= countCyrillic(s)) {
      return out;
    }
  } catch {
    // ignore
  }

  return s;
}

export function normalizeDeep<T>(val: T): T {
  if (typeof val === 'string') return fixMojibake(val) as unknown as T;
  if (Array.isArray(val)) return val.map((v) => normalizeDeep(v)) as unknown as T;
  if (val && typeof val === 'object') {
    const out: any = Array.isArray(val) ? [] : {};
    for (const [k, v] of Object.entries(val as any)) {
      out[k] = normalizeDeep(v);
    }
    return out as T;
  }
  return val;
}
