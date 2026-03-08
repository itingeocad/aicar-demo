/**
 * NOTE (v0.1.16):
 * We intentionally keep runtime text normalization VERY conservative.
 *
 * Reason: aggressive "mojibake repair" can easily make things worse and may
 * accidentally persist broken strings back into storage when configs are
 * migrated/rewritten.
 *
 * If you need to recover corrupted content already stored in Upstash,
 * use the admin repair/reset endpoints added in this patch:
 *  - /api/admin/config/repair?t=... (tries to repair/fallback per-field)
 *  - /api/admin/config/reset?t=...  (hard reset to defaults)
 */

export function fixMojibake(input: string): string {
  if (!input) return input;
  // Strip BOM + normalize NBSP to regular spaces for consistent UI.
  return input.replace(/\uFEFF/g, '').replace(/\u00A0/g, ' ');
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
