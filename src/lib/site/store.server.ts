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

function ensureDemoData016(cfg: SiteConfig) {
  // Ensure enough demo items for landing layout (9 offers, 4 clips)
  if (cfg.demoData.cars.length < 9) {
    cfg.demoData.cars.push({
      id: 'c9',
      title: 'Hyundai Tucson',
      price: 14500,
      currency: '$',
      year: 2017,
      mileageKm: 155000,
      city: 'Chișinău',
      fuel: 'Benzină',
      gearbox: 'AT',
      imageUrl: 'https://picsum.photos/seed/tucson/1200/800'
    });
  }
  if (cfg.demoData.reels.length < 4) {
    cfg.demoData.reels.push({
      id: 'r4',
      title: 'Qashqai: что смотреть',
      author: 'AICar',
      videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?seed=4',
      posterUrl: 'https://picsum.photos/seed/reel4/1200/800',
      linkedCarId: 'c8'
    });
  }
}

function migrate016(cfg: SiteConfig): SiteConfig {
  const cur = parseVer(cfg.version);
  const target = parseVer('0.1.6');
  if (!lt(cur, target)) return cfg;

  // Update landing/home blocks to match the wireframe, but only if page exists.
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

  // Add /news page if missing
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

  ensureDemoData016(cfg);
  cfg.version = '0.1.6';
  return cfg;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get<string>(upstashKey());
      if (raw && typeof raw === 'string') {
        const parsed = JSON.parse(raw) as SiteConfig;
        const migrated = migrate016(parsed);
        if (migrated.version !== parsed.version) await redis.set(upstashKey(), JSON.stringify(migrated));
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
    const migrated = migrate016(parsed);
    if (migrated.version !== parsed.version) {
      await fs.mkdir(path.dirname(p), { recursive: true });
      await fs.writeFile(p, JSON.stringify(migrated, null, 2), 'utf8');
    }
    return migrated;
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
