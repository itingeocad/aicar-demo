import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DEFAULT_SITE_CONFIG } from './defaultConfig';
import { SiteConfig } from './types';
import { getRedis } from '@/lib/kv/upstash.server';

function upstashKey() {
  return process.env.AICAR_SITE_CONFIG_KEY || 'aicar:siteConfig';
}

function configPath() {
  const p = process.env.AICAR_CONFIG_PATH;
  if (p) return p;
  return path.join(process.cwd(), '.tmp', 'site-config.json');
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get<string>(upstashKey());
      if (raw && typeof raw === 'string') return JSON.parse(raw) as SiteConfig;
    } catch {
      // ignore and fall back
    }
  }

  const p = configPath();
  try {
    const raw = await fs.readFile(p, 'utf8');
    return JSON.parse(raw) as SiteConfig;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export async function saveSiteConfig(next: SiteConfig): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(upstashKey(), JSON.stringify(next));
    return;
  }

  const p = configPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(next, null, 2), 'utf8');
}

export function getPageBySlug(config: SiteConfig, slugPath: string): SiteConfig['pages'][number] | undefined {
  const norm = slugPath.replace(/^\/+|\/+$/g, '');
  return config.pages.find((p) => p.slug === norm);
}
