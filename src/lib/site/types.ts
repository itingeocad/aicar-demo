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

export type NavChildItem = { label: string; href: string };
export type SiteNavItem = {
  label: string;
  /** Optional for items that act as dropdown groups */
  href?: string;
  children?: NavChildItem[];
};

export type FooterLink = { label: string; href: string };
export type FooterGroup = { title: string; links: FooterLink[] };
export type SocialLink = { label: string; href: string; kind?: string };
export type StoreBadge = { label: string; href: string; kind?: string };

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
    note: string;
    /** New grouped footer (preferred). */
    groups?: FooterGroup[];
    socials?: SocialLink[];
    storeBadges?: StoreBadge[];
    /** Legacy flat links (kept for backward compatibility). */
    links?: FooterLink[];
  };
  pages: PageDoc[];
  demoData: {
    cars: DemoCar[];
    reels: DemoReel[];
    news: DemoNews[];
    faq: DemoFaq[];
  };
};

export type VehicleType = 'car' | 'truck' | 'bus' | 'bike';

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
  vehicleType?: VehicleType;
};

export type DemoReel = {
  id: string;
  title: string;
  author: string;
  videoUrl: string;
  posterUrl: string;
  /** Optional image for cards (falls back to posterUrl). */
  thumbUrl?: string;
  /** Optional short preview video (falls back to videoUrl). */
  previewUrl?: string;
  /** Instagram-like counters for UI. */
  views?: number;
  likes?: number;
  /** Badges shown on cards. Example: ["AI"], ["Top"]. */
  badges?: ReadonlyArray<'AI' | 'Top'>;
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
