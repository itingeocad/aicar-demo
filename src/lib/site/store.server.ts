import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DEFAULT_SITE_CONFIG } from './defaultConfig';
import { SiteConfig } from './types';
import { getRedis } from '@/lib/kv/upstash.server';
import { normalizeDeep } from '@/lib/text/normalize';

function upstashKey() {
  return process.env.AICAR_SITE_CONFIG_KEY || 'aicar:siteConfig';
}

function configPath() {
  const p = process.env.AICAR_CONFIG_PATH;
  if (p) return p;
  return path.join(process.cwd(), '.tmp', 'site-config.json');
}

export function getPageBySlug(config: SiteConfig, slugPath: string): SiteConfig['pages'][number] | undefined {
  const norm = slugPath.replace(/^\/+|\/+$/g, '');
  return config.pages.find((p) => p.slug === norm);
}

function parseVer(v: string | undefined): [number, number, number] {
  if (!v) return [0, 0, 0];
  const parts = v.split('.').map((x) => Number(x));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function lt(a: [number, number, number], b: [number, number, number]) {
  if (a[0] !== b[0]) return a[0] < b[0];
  if (a[1] !== b[1]) return a[1] < b[1];
  return a[2] < b[2];
}

function ensureDemoData(cfg: SiteConfig) {
  // Ensure enough demo items and vehicle types.
  for (const c of cfg.demoData.cars) {
    if (!c.vehicleType) c.vehicleType = 'car';
  }

  const hasTruck = cfg.demoData.cars.some((c) => c.vehicleType === 'truck');
  const hasBus = cfg.demoData.cars.some((c) => c.vehicleType === 'bus');
  const hasBike = cfg.demoData.cars.some((c) => c.vehicleType === 'bike');

  const img = (seed: string) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;
  if (!hasBus) {
    cfg.demoData.cars.push({
      id: 'c10',
      title: 'Ford Transit (van)',
      price: 12900,
      currency: '$',
      year: 2016,
      mileageKm: 210000,
      city: 'Chișinău',
      fuel: 'Diesel',
      gearbox: 'MT',
      imageUrl: img('transit'),
      vehicleType: 'bus'
    });
  }
  if (!hasTruck) {
    cfg.demoData.cars.push({
      id: 'c11',
      title: 'MAN TGL (truck)',
      price: 18900,
      currency: '$',
      year: 2014,
      mileageKm: 350000,
      city: 'Bălți',
      fuel: 'Diesel',
      gearbox: 'MT',
      imageUrl: img('man_tgl'),
      vehicleType: 'truck'
    });
  }
  if (!hasBike) {
    cfg.demoData.cars.push({
      id: 'c12',
      title: 'Yamaha MT-07',
      price: 6200,
      currency: '$',
      year: 2018,
      mileageKm: 24000,
      city: 'Chișinău',
      fuel: 'Benzină',
      gearbox: 'MT',
      imageUrl: img('mt07'),
      vehicleType: 'bike'
    });
  }

  if (cfg.demoData.reels.length < 4) {
    cfg.demoData.reels.push({
      id: 'r4',
      title: 'Qashqai: что смотреть',
      author: 'AICar',
      videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?seed=4',
      posterUrl: 'https://picsum.photos/seed/reel4/1200/800',
      linkedCarId: cfg.demoData.cars[0]?.id
    });
  }
}

function migrate016(cfg: SiteConfig): SiteConfig {
  const cur = parseVer(cfg.version);
  const target = parseVer('0.1.6');
  if (!lt(cur, target)) return cfg;

  const home = getPageBySlug(cfg, '');
  if (home) {
    const byId = new Map(home.blocks.map((b) => [b.id, b]));

    const hero = byId.get('b_hero');
    if (hero && hero.type === 'hero') {
      hero.props = { ...hero.props, mode: 'banner', bannerHeight: 220, headline: 'Банер + Лого', subline: '' };
    }
    const ai = byId.get('b_ai');
    if (ai && ai.type === 'ai_prompt') {
      ai.props = {
        ...ai.props,
        title: 'AIChat',
        subtitle: 'Введите ваши предпочтения и ИИ поможет подобрать для Вас идеальный вариант',
        placeholder: 'Семейный автомобиль, внедорожник. От 2020 года и выше. Полная комплектация…',
        showButton: false,
        cta: 'Спросить'
      };
    }
    const search = byId.get('b_search');
    if (search && search.type === 'search_widget') {
      search.props = { ...search.props, mode: 'prototype', title: 'Расширенный поиск', cta: 'Найти авто' };
    }
    const strip = byId.get('b_strip');
    if (strip && strip.type === 'reels_strip') {
      strip.props = { ...strip.props, title: 'Лучшие AIClips', moreLabel: 'Больше', moreHref: '/aiclips', showArrows: true };
    }
    const offers = byId.get('b_offers');
    if (offers && offers.type === 'car_grid') {
      offers.props = { ...offers.props, title: 'Специальные предложения', limit: 9, variant: 'offers', moreLabel: 'Больше', moreHref: '/search' };
    }
    const sell = byId.get('b_sell');
    if (sell && sell.type === 'cta_sell') {
      sell.props = { ...sell.props, title: 'Подай объявление', cta: '+', href: '/sell', variant: 'plus_tile' };
    }
    const news = byId.get('b_news');
    if (news && news.type === 'news_cards') {
      news.props = { ...news.props, title: 'Новости AICar', limit: 1, variant: 'feature', moreLabel: 'Больше новостей', moreHref: '/news' };
    }
  }

  if (!cfg.pages.some((p) => p.slug === 'news')) {
    cfg.pages.push({
      id: 'p_news',
      title: 'Новости AICar',
      slug: 'news',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Новости AICar', align: 'center' } },
        { id: 'b_news', type: 'news_cards', props: { title: '', limit: 6, variant: 'cards' } }
      ]
    } as any);
  }

  ensureDemoData(cfg);
  cfg.version = '0.1.6';
  return cfg;
}

function migrate017(cfg: SiteConfig): SiteConfig {
  const cur = parseVer(cfg.version);
  const target = parseVer('0.1.7');
  if (!lt(cur, target)) return cfg;

  // Footer groups migration
  const footer: any = cfg.footer as any;
  if (!footer.groups || !Array.isArray(footer.groups) || footer.groups.length === 0) {
    const legacyLinks = Array.isArray(footer.links) ? footer.links : [];
    footer.groups = [
      { title: 'О проекте', links: legacyLinks.slice(0, 2) },
      { title: 'Документы', links: legacyLinks.slice(2) }
    ].filter((g) => g.links.length > 0);
  }
  if (!footer.socials) {
    footer.socials = [
      { label: 'Instagram', href: '#', kind: 'instagram' },
      { label: 'TikTok', href: '#', kind: 'tiktok' },
      { label: 'Telegram', href: '#', kind: 'telegram' },
      { label: 'Facebook', href: '#', kind: 'facebook' }
    ];
  }
  if (!footer.storeBadges) {
    footer.storeBadges = [
      { label: 'Get it on Google Play', href: '#', kind: 'google_play' },
      { label: 'Download on the App Store', href: '#', kind: 'app_store' }
    ];
  }

  // Ensure nav items have href
  cfg.nav.items = (cfg.nav.items as any[]).map((it) => {
    const href = it.href || (it.children && it.children[0] ? it.children[0].href : '/');
    return { ...it, href };
  });

  ensureDemoData(cfg);
  cfg.version = '0.1.7';
  return cfg;
}

function migrateAll(cfg: SiteConfig): SiteConfig {
  // Normalize mojibake first (helps migrations match strings).
  const normalized = normalizeDeep(cfg);
  let out = normalized;
  out = migrate016(out);
  out = migrate017(out);
  // Normalize again to fix any stored legacy values.
  out = normalizeDeep(out);
  return out;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get<string>(upstashKey());
      if (raw && typeof raw === 'string') {
        const parsed = JSON.parse(raw) as SiteConfig;
        const migrated = migrateAll(parsed);
        if (JSON.stringify(migrated) !== JSON.stringify(parsed)) {
          await redis.set(upstashKey(), JSON.stringify(migrated));
        }
        return migrated;
      }
    } catch {
      // ignore and fall back
    }
  }

  const p = configPath();
  try {
    const raw = await fs.readFile(p, 'utf8');
    const parsed = JSON.parse(raw) as SiteConfig;
    const migrated = migrateAll(parsed);
    if (JSON.stringify(migrated) !== JSON.stringify(parsed)) {
      await fs.mkdir(path.dirname(p), { recursive: true });
      await fs.writeFile(p, JSON.stringify(migrated, null, 2), 'utf8');
    }
    return migrated;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export async function saveSiteConfig(next: SiteConfig): Promise<void> {
  const cleaned = normalizeDeep(next);
  const redis = getRedis();
  if (redis) {
    await redis.set(upstashKey(), JSON.stringify(cleaned));
    return;
  }

  const p = configPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(cleaned, null, 2), 'utf8');
}
