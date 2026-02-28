export type DevicePreview = 'desktop' | 'mobile';

export type BlockType =
  | 'hero'
  | 'ai_prompt'
  | 'search_widget'
  | 'section_title'
  | 'car_detail'
  | 'car_grid'
  | 'car_list'
  | 'reels_strip'
  | 'reels_viewer'
  | 'faq'
  | 'cta_sell'
  | 'news_cards'
  | 'spacer';

export type BlockInstance = {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  isEnabled?: boolean;
};

export type PageDoc = {
  id: string;
  title: string;
  /**
   * Slug path without leading slash.
   * Examples: "" (home), "search", "aichat", "cars/[id]"
   */
  slug: string;
  isPublished: boolean;
  blocks: BlockInstance[];
};

export type SiteNavItem = { label: string; href: string };

export type ThemeTokens = {
  brandName: string;
  accent: string; // tailwind color string, e.g. "indigo"
};

export type SiteConfig = {
  version: string;
  theme: ThemeTokens;
  nav: {
    items: SiteNavItem[];
  };
  footer: {
    links: { label: string; href: string }[];
    note: string;
  };
  pages: PageDoc[];
  demoData: {
    cars: DemoCar[];
    reels: DemoReel[];
    news: DemoNews[];
    faq: DemoFaq[];
  };
};

export type DemoCar = {
  id: string;
  title: string;
  price: number;
  currency: string;
  year: number;
  mileageKm: number;
  city: string;
  imageUrl: string;
  fuel?: string;
  gearbox?: string;
};

export type DemoReel = {
  id: string;
  title: string;
  author: string;
  videoUrl: string;
  posterUrl: string;
  linkedCarId?: string;
};

export type DemoNews = {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
};

export type DemoFaq = {
  id: string;
  q: string;
  a: string;
};
