import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DEFAULT_SITE_CONFIG } from './defaultConfig';
import { SiteConfig } from './types';

function configPath() {
  const p = process.env.AICAR_CONFIG_PATH;
  if (p) return p;
  return path.join(process.cwd(), '.tmp', 'site-config.json');
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const p = configPath();
  try {
    const raw = await fs.readFile(p, 'utf8');
    return JSON.parse(raw) as SiteConfig;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export async function saveSiteConfig(next: SiteConfig): Promise<void> {
  const p = configPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(next, null, 2), 'utf8');
}

export function getPageBySlug(config: SiteConfig, slugPath: string): SiteConfig['pages'][number] | undefined {
  const norm = slugPath.replace(/^\/+|\/+$/g, '');
  return config.pages.find((p) => p.slug === norm);
}
