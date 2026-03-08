import { SiteConfig } from './types';

function img(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;
}

function vid(seed: string) {
  // demo-friendly public mp4. You can replace later with S3/CDN.
  return `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?seed=${encodeURIComponent(seed)}`;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  version: '0.1.11',
  theme: {
    brandName: 'AICar',
    accent: 'indigo'
  },
  nav: {
    items: [
      {
        label: 'Р С’Р Р†РЎвЂљР С•',
        href: '/search',
        children: [
          { label: 'Р В Р В°РЎРѓРЎв‚¬Р С‘РЎР‚Р ВµР Р…Р Р…РЎвЂ№Р в„– Р С—Р С•Р С‘РЎРѓР С”', href: '/search' },
          { label: 'Р С›Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘РЎРЏ', href: '/cars' },
          { label: 'Р СџР С•Р Т‘Р В°РЎвЂљРЎРЉ Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘Р Вµ', href: '/sell' }
        ]
      },
      { label: 'AIClips', href: '/aiclips' },
      { label: 'AIChat', href: '/aichat' }
    ]
  },
  footer: {
    note: 'Demo build РІР‚Сћ Р С”Р С•Р Р…РЎвЂљР ВµР Р…РЎвЂљ Р С‘ Р СР ВµР Т‘Р С‘Р В° Р СР С•Р С–РЎС“РЎвЂљ Р В±РЎвЂ№РЎвЂљРЎРЉ Р СР С•Р С”Р С•Р Р†РЎвЂ№Р СР С‘',
    groups: [
      {
        title: 'Р С› Р С—РЎР‚Р С•Р ВµР С”РЎвЂљР Вµ',
        links: [
          { label: 'Р С› Р С—РЎР‚Р С•Р ВµР С”РЎвЂљР Вµ', href: '/about' },
          { label: 'Р С™Р С•Р Р…РЎвЂљР В°Р С”РЎвЂљРЎвЂ№', href: '/contacts' }
        ]
      },
      {
        title: 'Р вЂќР С•Р С”РЎС“Р СР ВµР Р…РЎвЂљРЎвЂ№',
        links: [
          { label: 'Р СџР С•Р В»Р С‘РЎвЂљР С‘Р С”Р В°', href: '/privacy' },
          { label: 'Р Р€РЎРѓР В»Р С•Р Р†Р С‘РЎРЏ', href: '/terms' }
        ]
      },
      {
        title: 'Р В Р В°Р В·Р Т‘Р ВµР В»РЎвЂ№',
        links: [
          { label: 'AIClips', href: '/aiclips' },
          { label: 'AIChat', href: '/aichat' },
          { label: 'Р С›Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘РЎРЏ', href: '/cars' }
        ]
      }
    ],
    socials: [
      { label: 'Instagram', href: '#', kind: 'instagram' },
      { label: 'TikTok', href: '#', kind: 'tiktok' },
      { label: 'Telegram', href: '#', kind: 'telegram' },
      { label: 'Facebook', href: '#', kind: 'facebook' }
    ],
    storeBadges: [
      { label: 'Get it on Google Play', href: '#', kind: 'google_play' },
      { label: 'Download on the App Store', href: '#', kind: 'app_store' }
    ]
  },
  pages: [
    {
      id: 'p_home',
      title: 'Р вЂњР В»Р В°Р Р†Р Р…Р В°РЎРЏ',
      slug: '',
      isPublished: true,
      blocks: [
        { id: 'b_hero', type: 'hero', props: { mode: 'banner', bannerHeight: 220, headline: 'Р вЂР В°Р Р…Р ВµРЎР‚ + Р вЂєР С•Р С–Р С•', subline: '' } },
        {
          id: 'b_ai',
          type: 'ai_prompt',
          props: {
            title: 'AIChat',
            subtitle: 'Р вЂ™Р Р†Р ВµР Т‘Р С‘РЎвЂљР Вµ Р Р†Р В°РЎв‚¬Р С‘ Р С—РЎР‚Р ВµР Т‘Р С—Р С•РЎвЂЎРЎвЂљР ВµР Р…Р С‘РЎРЏ Р С‘ Р ВР В Р С—Р С•Р СР С•Р В¶Р ВµРЎвЂљ Р С—Р С•Р Т‘Р С•Р В±РЎР‚Р В°РЎвЂљРЎРЉ Р Т‘Р В»РЎРЏ Р вЂ™Р В°РЎРѓ Р С‘Р Т‘Р ВµР В°Р В»РЎРЉР Р…РЎвЂ№Р в„– Р Р†Р В°РЎР‚Р С‘Р В°Р Р…РЎвЂљ',
            placeholder: 'Р РЋР ВµР СР ВµР в„–Р Р…РЎвЂ№Р в„– Р В°Р Р†РЎвЂљР С•Р СР С•Р В±Р С‘Р В»РЎРЉ, Р Р†Р Р…Р ВµР Т‘Р С•РЎР‚Р С•Р В¶Р Р…Р С‘Р С”. Р С›РЎвЂљ 2020 Р С–Р С•Р Т‘Р В° Р С‘ Р Р†РЎвЂ№РЎв‚¬Р Вµ. Р СџР С•Р В»Р Р…Р В°РЎРЏ Р С”Р С•Р СР С—Р В»Р ВµР С”РЎвЂљР В°РЎвЂ Р С‘РЎРЏРІР‚В¦',
            showButton: false,
            cta: 'Р РЋР С—РЎР‚Р С•РЎРѓР С‘РЎвЂљРЎРЉ'
          }
        },
        { id: 'b_search', type: 'search_widget', props: { mode: 'prototype', title: 'Р В Р В°РЎРѓРЎв‚¬Р С‘РЎР‚Р ВµР Р…Р Р…РЎвЂ№Р в„– Р С—Р С•Р С‘РЎРѓР С”', cta: 'Р СњР В°Р в„–РЎвЂљР С‘ Р В°Р Р†РЎвЂљР С•' } },
        { id: 'b_strip', type: 'reels_strip', props: { title: 'Р вЂєРЎС“РЎвЂЎРЎв‚¬Р С‘Р Вµ AIClips', moreLabel: 'Р вЂР С•Р В»РЎРЉРЎв‚¬Р Вµ', moreHref: '/aiclips', showArrows: true } },
        { id: 'b_offers', type: 'car_grid', props: { title: 'Р РЋР С—Р ВµРЎвЂ Р С‘Р В°Р В»РЎРЉР Р…РЎвЂ№Р Вµ Р С—РЎР‚Р ВµР Т‘Р В»Р С•Р В¶Р ВµР Р…Р С‘РЎРЏ', limit: 9, variant: 'offers', moreLabel: 'Р вЂР С•Р В»РЎРЉРЎв‚¬Р Вµ', moreHref: '/search' } },
        { id: 'b_sell', type: 'cta_sell', props: { title: 'Р СџР С•Р Т‘Р В°Р в„– Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘Р Вµ', text: '', cta: '+', href: '/sell', variant: 'plus_tile' } },
        { id: 'b_news', type: 'news_cards', props: { title: 'Р СњР С•Р Р†Р С•РЎРѓРЎвЂљР С‘ AICar', limit: 1, variant: 'feature', moreLabel: 'Р вЂР С•Р В»РЎРЉРЎв‚¬Р Вµ Р Р…Р С•Р Р†Р С•РЎРѓРЎвЂљР ВµР в„–', moreHref: '/news' } }
      ]
    },
    {
      id: 'p_search',
      title: 'Р В Р В°РЎРѓРЎв‚¬Р С‘РЎР‚Р ВµР Р…Р Р…РЎвЂ№Р в„– Р С—Р С•Р С‘РЎРѓР С”',
      slug: 'search',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Р В Р В°РЎРѓРЎв‚¬Р С‘РЎР‚Р ВµР Р…Р Р…РЎвЂ№Р в„– Р С—Р С•Р С‘РЎРѓР С”' } },
        { id: 'b_search', type: 'search_widget', props: { mode: 'prototype', title: 'Р В¤Р С‘Р В»РЎРЉРЎвЂљРЎР‚РЎвЂ№', cta: 'Р СњР В°Р в„–РЎвЂљР С‘' } },
        { id: 'b_hot', type: 'car_grid', props: { title: 'Р вЂњР С•РЎР‚РЎРЏРЎвЂЎР С‘Р Вµ Р С—РЎР‚Р ВµР Т‘Р В»Р С•Р В¶Р ВµР Р…Р С‘РЎРЏ', limit: 6 } },
        { id: 'b_list', type: 'car_list', props: { title: 'Р В Р ВµР В·РЎС“Р В»РЎРЉРЎвЂљР В°РЎвЂљРЎвЂ№', limit: 12 } }
      ]
    },
    {
      id: 'p_search2',
      title: 'Р В Р В°РЎРѓРЎв‚¬Р С‘РЎР‚Р ВµР Р…Р Р…РЎвЂ№Р в„– Р С—Р С•Р С‘РЎРѓР С” (Р Р†Р В°РЎР‚Р С‘Р В°Р Р…РЎвЂљ 2)',
      slug: 'search-v2',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Р В Р В°РЎРѓРЎв‚¬Р С‘РЎР‚Р ВµР Р…Р Р…РЎвЂ№Р в„– Р С—Р С•Р С‘РЎРѓР С” РІР‚вЂќ Р Р†Р В°РЎР‚Р С‘Р В°Р Р…РЎвЂљ 2' } },
        { id: 'b_search', type: 'search_widget', props: { mode: 'prototype', title: 'Р В¤Р С‘Р В»РЎРЉРЎвЂљРЎР‚РЎвЂ№', cta: 'Р СњР В°Р в„–РЎвЂљР С‘' } },
        { id: 'b_list', type: 'car_list', props: { title: 'Р В Р ВµР В·РЎС“Р В»РЎРЉРЎвЂљР В°РЎвЂљРЎвЂ№', limit: 12, withSidebarHint: true } }
      ]
    },
    {
      id: 'p_aiclips',
      title: 'AIClips',
      slug: 'aiclips',
      isPublished: true,
      blocks: [{ id: 'b_viewer', type: 'reels_viewer', props: { title: 'AIClips' } }]
    },
    {
      id: 'p_aichat',
      title: 'AIChat',
      slug: 'aichat',
      isPublished: true,
      blocks: [
        { id: 'b_hero', type: 'hero', props: { headline: 'AIChat', subline: 'Р вЂ”Р В°Р Т‘Р В°Р в„– Р Р†Р С•Р С—РЎР‚Р С•РЎРѓ Р С‘ Р С—Р С•Р В»РЎС“РЎвЂЎР С‘ Р С—Р С•Р Т‘Р В±Р С•РЎР‚ Р В°Р Р†РЎвЂљР С• Р С‘ РЎРѓР С•Р Р†Р ВµРЎвЂљРЎвЂ№' } },
        { id: 'b_ai', type: 'ai_prompt', props: { placeholder: 'Р СњР В°Р С—РЎР‚Р С‘Р СР ВµРЎР‚: Р’В«Р С™Р В°Р С”Р С•Р в„– Р С”РЎР‚Р С•РЎРѓРЎРѓР С•Р Р†Р ВµРЎР‚ Р В»РЎС“РЎвЂЎРЎв‚¬Р Вµ Р Т‘Р С• 15 000$?Р’В»', cta: 'Р РЋР С—РЎР‚Р С•РЎРѓР С‘РЎвЂљРЎРЉ' } },
        { id: 'b_faq', type: 'faq', props: { title: 'FAQ', limit: 6 } }
      ]
    },
    {
      id: 'p_news',
      title: 'Р СњР С•Р Р†Р С•РЎРѓРЎвЂљР С‘ AICar',
      slug: 'news',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Р СњР С•Р Р†Р С•РЎРѓРЎвЂљР С‘ AICar', align: 'center' } },
        { id: 'b_news', type: 'news_cards', props: { title: '', limit: 6, variant: 'cards' } }
      ]
    },
    {
      id: 'p_sell',
      title: 'Р СџР С•Р Т‘Р В°РЎвЂЎР В° Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘РЎРЏ',
      slug: 'sell',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Р СџР С•Р Т‘Р В°РЎвЂЎР В° Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘РЎРЏ' } },
        { id: 'b_spacer', type: 'spacer', props: { h: 12 } },
        { id: 'b_sell', type: 'cta_sell', props: { title: 'Р С’Р Р…Р С”Р ВµРЎвЂљР В° Р Р† Р Т‘Р ВµР СР С• РЎС“Р С—РЎР‚Р С•РЎвЂ°Р ВµР Р…Р В°', text: 'Р СњР В° РЎРѓР В»Р ВµР Т‘РЎС“РЎР‹РЎвЂ°Р ВµР С РЎв‚¬Р В°Р С–Р Вµ Р Т‘Р С•Р В±Р В°Р Р†Р С‘Р С Р С—Р С•Р В»Р Р…Р С•РЎвЂ Р ВµР Р…Р Р…РЎС“РЎР‹ РЎвЂћР С•РЎР‚Р СРЎС“ Р С‘ Р СР ВµР Т‘Р С‘Р В°-Р В·Р В°Р С–РЎР‚РЎС“Р В·Р С”РЎС“.', cta: 'Р С›Р С”', href: '/' } }
      ]
    },
    {
      id: 'p_car_detail_tpl',
      title: 'Р РЃР В°Р В±Р В»Р С•Р Р…: Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘Р Вµ',
      slug: 'cars/[id]',
      isPublished: true,
      blocks: [
        { id: 'b_car', type: 'car_detail', props: { showAskAi: true, showLeadButton: true } },
        { id: 'b_sim', type: 'car_grid', props: { title: 'Р СџР С•РЎвЂ¦Р С•Р В¶Р С‘Р Вµ Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘РЎРЏ', limit: 6 } }
      ]
    }
  ],
  demoData: {
    cars: [
      { id: 'c1', title: 'Toyota Corolla', price: 9800, currency: '$', year: 2014, mileageKm: 165000, city: 'ChiРв„ўinР”С“u', fuel: 'BenzinР”С“', gearbox: 'AT', imageUrl: img('corolla'), vehicleType: 'car' },
      { id: 'c2', title: 'BMW 3 Series', price: 13900, currency: '$', year: 2013, mileageKm: 190000, city: 'BР”С“lРвЂєi', fuel: 'Diesel', gearbox: 'AT', imageUrl: img('bmw3'), vehicleType: 'car' },
      { id: 'c3', title: 'Volkswagen Passat', price: 11700, currency: '$', year: 2015, mileageKm: 175000, city: 'Cahul', fuel: 'Diesel', gearbox: 'MT', imageUrl: img('passat'), vehicleType: 'car' },
      { id: 'c4', title: 'Honda CR-V', price: 15800, currency: '$', year: 2012, mileageKm: 210000, city: 'Orhei', fuel: 'BenzinР”С“', gearbox: 'AT', imageUrl: img('crv'), vehicleType: 'car' },
      { id: 'c5', title: 'Skoda Octavia', price: 10500, currency: '$', year: 2016, mileageKm: 150000, city: 'ChiРв„ўinР”С“u', fuel: 'BenzinР”С“', gearbox: 'MT', imageUrl: img('octavia'), vehicleType: 'car' },
      { id: 'c6', title: 'Mercedes C-Class', price: 16900, currency: '$', year: 2012, mileageKm: 220000, city: 'Ungheni', fuel: 'Diesel', gearbox: 'AT', imageUrl: img('cclass'), vehicleType: 'car' },
      { id: 'c7', title: 'Mazda 6', price: 12400, currency: '$', year: 2015, mileageKm: 160000, city: 'Soroca', fuel: 'BenzinР”С“', gearbox: 'AT', imageUrl: img('mazda6'), vehicleType: 'car' },
      { id: 'c8', title: 'Nissan Qashqai', price: 13200, currency: '$', year: 2016, mileageKm: 170000, city: 'ChiРв„ўinР”С“u', fuel: 'Diesel', gearbox: 'MT', imageUrl: img('qashqai'), vehicleType: 'car' },
      { id: 'c9', title: 'Hyundai Tucson', price: 14500, currency: '$', year: 2017, mileageKm: 155000, city: 'ChiРв„ўinР”С“u', fuel: 'BenzinР”С“', gearbox: 'AT', imageUrl: img('tucson'), vehicleType: 'car' },
      { id: 'c10', title: 'Ford Transit (van)', price: 12900, currency: '$', year: 2016, mileageKm: 210000, city: 'ChiРв„ўinР”С“u', fuel: 'Diesel', gearbox: 'MT', imageUrl: img('transit'), vehicleType: 'bus' },
      { id: 'c11', title: 'MAN TGL (truck)', price: 18900, currency: '$', year: 2014, mileageKm: 350000, city: 'BР”С“lРвЂєi', fuel: 'Diesel', gearbox: 'MT', imageUrl: img('man_tgl'), vehicleType: 'truck' },
      { id: 'c12', title: 'Yamaha MT-07', price: 6200, currency: '$', year: 2018, mileageKm: 24000, city: 'ChiРв„ўinР”С“u', fuel: 'BenzinР”С“', gearbox: 'MT', imageUrl: img('mt07'), vehicleType: 'bike' }
    ],
    reels: [
      { id: 'r1', title: 'Corolla: Р С—Р В»РЎР‹РЎРѓРЎвЂ№/Р СР С‘Р Р…РЎС“РЎРѓРЎвЂ№', author: 'AICar', videoUrl: vid('1'), posterUrl: img('reel1'), linkedCarId: 'c1' },
      { id: 'r2', title: 'Passat: РЎвЂЎРЎвЂљР С• Р С—РЎР‚Р С•Р Р†Р ВµРЎР‚Р С‘РЎвЂљРЎРЉ', author: 'AICar', videoUrl: vid('2'), posterUrl: img('reel2'), linkedCarId: 'c3' },
      { id: 'r3', title: 'CR-V Р Т‘Р В»РЎРЏ РЎРѓР ВµР СРЎРЉР С‘', author: 'AICar', videoUrl: vid('3'), posterUrl: img('reel3'), linkedCarId: 'c4' },
      { id: 'r4', title: 'Qashqai: РЎвЂЎРЎвЂљР С• РЎРѓР СР С•РЎвЂљРЎР‚Р ВµРЎвЂљРЎРЉ', author: 'AICar', videoUrl: vid('4'), posterUrl: img('reel4'), linkedCarId: 'c8' }
    ],
    news: [
      { id: 'n1', title: 'Р С™Р В°Р С” Р Р†РЎвЂ№Р В±РЎР‚Р В°РЎвЂљРЎРЉ Р В°Р Р†РЎвЂљР С• Р Т‘Р С• $10k', excerpt: 'Р С™Р С•РЎР‚Р С•РЎвЂљР С”Р С‘Р в„– РЎвЂЎР ВµР С”-Р В»Р С‘РЎРѓРЎвЂљ Р Т‘Р В»РЎРЏ РЎР‚Р В°Р В·РЎС“Р СР Р…Р С•Р в„– Р С—Р С•Р С”РЎС“Р С—Р С”Р С‘.', imageUrl: img('news1') },
      { id: 'n2', title: 'Р СћР С›Р Сџ-5 Р С•РЎв‚¬Р С‘Р В±Р С•Р С” Р С—РЎР‚Р С‘ Р С—Р С•Р С”РЎС“Р С—Р С”Р Вµ', excerpt: 'Р СњР В° РЎвЂЎРЎвЂљР С• Р В»РЎР‹Р Т‘Р С‘ РЎвЂЎР В°РЎвЂ°Р Вµ Р Р†РЎРѓР ВµР С–Р С• Р Р…Р Вµ Р С•Р В±РЎР‚Р В°РЎвЂ°Р В°РЎР‹РЎвЂљ Р Р†Р Р…Р С‘Р СР В°Р Р…Р С‘Р Вµ.', imageUrl: img('news2') },
      { id: 'n3', title: 'Р СџР С•РЎвЂЎР ВµР СРЎС“ Р Р†Р В°Р В¶Р Р…Р В° Р Т‘Р С‘Р В°Р С–Р Р…Р С•РЎРѓРЎвЂљР С‘Р С”Р В°', excerpt: 'Р В Р С”Р В°Р С” Р Р…Р Вµ Р С—Р С•Р С—Р В°РЎРѓРЎвЂљРЎРЉ Р Р…Р В° РЎР‚Р ВµР СР С•Р Р…РЎвЂљ.', imageUrl: img('news3') }
    ],
    faq: [
      { id: 'f1', q: 'Р В§РЎвЂљР С• РЎвЂљР В°Р С”Р С•Р Вµ AIChat?', a: 'Р В­РЎвЂљР С• AI-Р С”Р С•Р Р…РЎРѓРЎС“Р В»РЎРЉРЎвЂљР В°Р Р…РЎвЂљ, Р С”Р С•РЎвЂљР С•РЎР‚РЎвЂ№Р в„– Р С—Р С•Р СР С•Р С–Р В°Р ВµРЎвЂљ Р С—Р С•Р Т‘Р С•Р В±РЎР‚Р В°РЎвЂљРЎРЉ Р В°Р Р†РЎвЂљР С• Р С‘ Р С•Р В±РЎР‰РЎРЏРЎРѓР Р…РЎРЏР ВµРЎвЂљ Р Р…РЎР‹Р В°Р Р…РЎРѓРЎвЂ№.' },
      { id: 'f2', q: 'AIChat Р Р†Р С‘Р Т‘Р С‘РЎвЂљ РЎР‚Р ВµР В°Р В»РЎРЉР Р…РЎвЂ№Р Вµ Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘РЎРЏ?', a: 'Р вЂ™ Р Т‘Р ВµР СР С• РІР‚вЂќ Р Т‘Р В°, Р С‘Р В· Р СР С•Р С”-Р Т‘Р В°Р Р…Р Р…РЎвЂ№РЎвЂ¦. Р вЂ™ Р С—РЎР‚Р С•Р Т‘Р Вµ РІР‚вЂќ Р В±РЎС“Р Т‘Р ВµРЎвЂљ Р В±РЎР‚Р В°РЎвЂљРЎРЉ Р С‘Р В· Р В±Р В°Р В·РЎвЂ№ Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘Р в„–.' },
      { id: 'f3', q: 'Р СљР С•Р В¶Р Р…Р С• Р В»Р С‘ Р С—РЎР‚Р С•Р Т‘Р В°Р Р†Р В°РЎвЂљРЎРЉ Р В°Р Р†РЎвЂљР С•?', a: 'Р вЂќР В°, РЎвЂЎР ВµРЎР‚Р ВµР В· РЎР‚Р В°Р В·Р Т‘Р ВµР В» Р’В«Р СџР С•Р Т‘Р В°РЎвЂљРЎРЉ Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘Р ВµР’В».' },
      { id: 'f4', q: 'Р В§РЎвЂљР С• РЎвЂљР В°Р С”Р С•Р Вµ AIClips?', a: 'Р С™Р С•РЎР‚Р С•РЎвЂљР С”Р С‘Р Вµ Р Р†Р С‘Р Т‘Р ВµР С•-Р С•Р В±Р В·Р С•РЎР‚РЎвЂ№ Р С—Р С• Р СР С•Р Т‘Р ВµР В»РЎРЏР С, Р С—Р С•РЎвЂ¦Р С•Р В¶Р С‘Р Вµ Р Р…Р В° Reels.' },
      { id: 'f5', q: 'Р вЂРЎС“Р Т‘Р ВµРЎвЂљ Р В»Р С‘ Р СР С•Р Т‘Р ВµРЎР‚Р В°РЎвЂ Р С‘РЎРЏ?', a: 'Р вЂќР В°, Р С”Р С•Р Р…РЎвЂљР ВµР Р…РЎвЂљ Р С‘ Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘РЎРЏ Р В±РЎС“Р Т‘РЎС“РЎвЂљ Р С—РЎР‚Р С•РЎвЂ¦Р С•Р Т‘Р С‘РЎвЂљРЎРЉ Р СР С•Р Т‘Р ВµРЎР‚Р В°РЎвЂ Р С‘РЎР‹.' },
      { id: 'f6', q: 'Р С™Р С•Р С–Р Т‘Р В° Р В±РЎС“Р Т‘Р ВµРЎвЂљ Р С—РЎР‚Р С•Р Т‘?', a: 'Р СџР С•РЎРѓР В»Р Вµ Р Т‘Р ВµР СР С• РІР‚вЂќ Р С—Р ВµРЎР‚Р ВµР Р…Р С•РЎРѓ Р Р…Р В° Р С—РЎР‚Р С•Р Т‘Р С•Р Р†РЎС“РЎР‹ Р С‘Р Р…РЎвЂћРЎР‚Р В°РЎРѓРЎвЂљРЎР‚РЎС“Р С”РЎвЂљРЎС“РЎР‚РЎС“ (Р вЂР вЂќ, Р СР ВµР Т‘Р С‘Р В°, AI RAG).' }
    ]
  }
};
