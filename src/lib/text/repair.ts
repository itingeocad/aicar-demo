/**
 * Text repair with safe fallback to defaults.
 *
 * This module is used by /api/admin/config/repair to recover user-facing strings
 * that got corrupted by encoding/decoding issues (classic UTF-8->CP1251 mojibake
 * like "РђРІС‚Рѕ", "Р’" fragments, "вЂ" punctuation, etc.).
 *
 * Strategy:
 *  1) Detect suspicious strings.
 *  2) Try very limited one-step repairs:
 *     - CP1251 bytes interpreted as UTF-8
 *     - Latin1/Win1252 bytes interpreted as UTF-8
 *  3) If still suspicious, fall back to the corresponding DEFAULT value
 *     (when provided).
 */

export type RepairStats = {
  scannedStrings: number;
  fixedStrings: number;
  fallbackStrings: number;
};

function isCyrillic(cp: number) {
  return (cp >= 0x0400 && cp <= 0x04ff) || (cp >= 0x0500 && cp <= 0x052f);
}

function cyrCount(s: string) {
  let n = 0;
  for (const ch of s) if (isCyrillic(ch.codePointAt(0) ?? 0)) n += 1;
  return n;
}

function markerCount(s: string) {
  // Typical mojibake markers.
  const badPairs = (s.match(/[РС][\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2030\u2039\u203A\u20AC\u2122]/g) || []).length;
  const rs = (s.match(/[РС]/g) || []).length;
  const dn = (s.match(/[ÐÑ]/g) || []).length;
  const vd = (s.match(/вЂ/g) || []).length;
  const repl = (s.match(/\uFFFD/g) || []).length;
  const weirdUA = (s.match(/[ЋІ]/g) || []).length;
  const spacedVe = (s.match(/В\s{2,}В/g) || []).length;
  return badPairs * 3 + rs + dn * 2 + vd * 3 + repl * 8 + weirdUA * 2 + spacedVe * 4;
}

export function looksSuspicious(s: string): boolean {
  if (!s) return false;

  // Strong markers.
  if (/[ÐÑ]/.test(s)) return true;
  if (/вЂ/.test(s)) return true;
  if (/[РС][\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2030\u2039\u203A\u20AC\u2122]/.test(s)) return true;

  // Very noisy "stage 2" corruption.
  const ve = (s.match(/В/g) || []).length;
  if (ve >= 4 && /[ЋІ‚„™]/.test(s)) return true;
  if (/В\s{2,}В/.test(s)) return true;

  // High RS ratio is usually suspicious (but keep threshold conservative).
  const rs = (s.match(/[РС]/g) || []).length;
  if (rs >= 6 && rs / Math.max(1, s.length) >= 0.18) return true;

  return false;
}

// --- CP1251 mapping (unicode -> byte) ---
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
  for (let i = 0; i < 0x80; i += 1) m.set(i, i);
  for (let i = 0; i < CP1251_TABLE.length; i += 1) {
    m.set(CP1251_TABLE[i], 0x80 + i);
  }
  return m;
})();

function encodeCp1251Bytes(s: string): Uint8Array | null {
  const out: number[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp === 0xfffd) return null;

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

function decodeUtf8(bytes: Uint8Array): string {
  // TextDecoder is available in Node 20+ and Edge runtime.
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

function tryFixCp1251ToUtf8(s: string): string | null {
  // Only attempt if there are strong CP1251-mojibake markers.
  if (!looksSuspicious(s)) return null;

  const bytes = encodeCp1251Bytes(s);
  if (!bytes) return null;

  const out = decodeUtf8(bytes);
  return out;
}

function tryFixLatin1ToUtf8(s: string): string | null {
  // Works for "ÐÐ²Ñ‚Ð¾" style corruption.
  // Only safe if all codepoints fit into a byte.
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp > 0xff) return null;
  }
  const bytes = new Uint8Array([...s].map((c) => c.charCodeAt(0) & 0xff));
  return decodeUtf8(bytes);
}

function cleanup(s: string): string {
  return s
    .replace(/\uFEFF/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\uFFFD/g, '');
}

function pickBest(original: string, candidate: string): string {
  const o = cleanup(original);
  const c = cleanup(candidate);

  // Prefer fewer markers, then more Cyrillic.
  const oM = markerCount(o);
  const cM = markerCount(c);
  if (cM < oM) return c;
  if (cM > oM) return o;

  const oC = cyrCount(o);
  const cC = cyrCount(c);
  if (cC > oC) return c;

  return o;
}

export function repairString(input: string, fallback?: string): { value: string; usedFallback: boolean; fixed: boolean } {
  const original = input ?? '';
  const trimmed = cleanup(original);

  if (!looksSuspicious(trimmed)) {
    return { value: trimmed, usedFallback: false, fixed: trimmed !== original };
  }

  let best = trimmed;

  const cp = tryFixCp1251ToUtf8(best);
  if (cp) best = pickBest(best, cp);

  const l1 = tryFixLatin1ToUtf8(trimmed);
  if (l1) best = pickBest(best, l1);

  const stillBad = looksSuspicious(best) || markerCount(best) >= markerCount(trimmed);

  if (stillBad && typeof fallback === 'string' && fallback.length > 0) {
    return { value: cleanup(fallback), usedFallback: true, fixed: true };
  }

  return { value: best, usedFallback: false, fixed: best !== trimmed };
}

function isRecord(x: any): x is Record<string, any> {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}

function arrayHasId(arr: any[]): boolean {
  return arr.some((x) => isRecord(x) && typeof x.id === 'string');
}

function indexById(arr: any[]): Map<string, any> {
  const m = new Map<string, any>();
  for (const it of arr) {
    if (isRecord(it) && typeof it.id === 'string') m.set(it.id, it);
  }
  return m;
}

export function repairDeepWithFallback<T>(val: T, fallback?: any, stats?: RepairStats): T {
  const st: RepairStats = stats || { scannedStrings: 0, fixedStrings: 0, fallbackStrings: 0 };

  function walk(cur: any, fb: any): any {
    if (cur === null || cur === undefined) return cur;

    if (typeof cur === 'string') {
      st.scannedStrings += 1;
      const res = repairString(cur, typeof fb === 'string' ? fb : undefined);
      if (res.fixed) st.fixedStrings += 1;
      if (res.usedFallback) st.fallbackStrings += 1;
      return res.value;
    }

    if (Array.isArray(cur)) {
      const out: any[] = [];
      const fbArr = Array.isArray(fb) ? fb : undefined;

      if (fbArr && arrayHasId(cur) && arrayHasId(fbArr)) {
        const fbById = indexById(fbArr);
        for (const item of cur) {
          const fbItem = isRecord(item) && typeof item.id === 'string' ? fbById.get(item.id) : undefined;
          out.push(walk(item, fbItem));
        }
        // Add missing fallback items (rare, but keeps schema complete)
        for (const [id, fbItem] of fbById.entries()) {
          if (!cur.some((x) => isRecord(x) && x.id === id)) out.push(walk(fbItem, fbItem));
        }
        return out;
      }

      for (let i = 0; i < cur.length; i += 1) {
        out.push(walk(cur[i], fbArr ? fbArr[i] : undefined));
      }
      return out;
    }

    if (isRecord(cur)) {
      const out: Record<string, any> = {};
      const fbObj = isRecord(fb) ? fb : undefined;

      // keep existing keys
      for (const [k, v] of Object.entries(cur)) {
        out[k] = walk(v, fbObj ? fbObj[k] : undefined);
      }
      // add missing default keys
      if (fbObj) {
        for (const [k, v] of Object.entries(fbObj)) {
          if (!(k in out)) out[k] = walk(v, v);
        }
      }

      return out;
    }

    return cur;
  }

  const repaired = walk(val as any, fallback);
  // ensure stats object updated for caller
  if (!stats) {
    // no-op
  } else {
    stats.scannedStrings = st.scannedStrings;
    stats.fixedStrings = st.fixedStrings;
    stats.fallbackStrings = st.fallbackStrings;
  }

  return repaired as T;
}
