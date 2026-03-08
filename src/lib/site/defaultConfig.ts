import { SiteConfig } from './types';

function img(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;
}

function vid(seed: string) {
  // demo-friendly public mp4. You can replace later with S3/CDN.
  return `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?seed=${encodeURIComponent(seed)}`;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  version: '0.1.12',
  theme: {
    brandName: 'AICar',
    accent: 'indigo'
  },
  nav: {
    items: [
      {
        label: 'РђРІС‚Рѕ',
        href: '/search',
        children: [
          { label: 'Р Р°СЃС€РёСЂРµРЅРЅС‹Р№ РїРѕРёСЃРє', href: '/search' },
          { label: 'РћР±СЉСЏРІР»РµРЅРёСЏ', href: '/cars' },
          { label: 'РџРѕРґР°С‚СЊ РѕР±СЉСЏРІР»РµРЅРёРµ', href: '/sell' }
        ]
      },
      { label: 'AIClips', href: '/aiclips' },
      { label: 'AIChat', href: '/aichat' }
    ]
  },
  footer: {
    note: 'Demo build вЂў РєРѕРЅС‚РµРЅС‚ Рё РјРµРґРёР° РјРѕРіСѓС‚ Р±С‹С‚СЊ РјРѕРєРѕРІС‹РјРё',
    groups: [
      {
        title: 'Рћ РїСЂРѕРµРєС‚Рµ',
        links: [
          { label: 'Рћ РїСЂРѕРµРєС‚Рµ', href: '/about' },
          { label: 'РљРѕРЅС‚Р°РєС‚С‹', href: '/contacts' }
        ]
      },
      {
        title: 'Р”РѕРєСѓРјРµРЅС‚С‹',
        links: [
          { label: 'РџРѕР»РёС‚РёРєР°', href: '/privacy' },
          { label: 'РЈСЃР»РѕРІРёСЏ', href: '/terms' }
        ]
      },
      {
        title: 'Р Р°Р·РґРµР»С‹',
        links: [
          { label: 'AIClips', href: '/aiclips' },
          { label: 'AIChat', href: '/aichat' },
          { label: 'РћР±СЉСЏРІР»РµРЅРёСЏ', href: '/cars' }
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
      title: 'Р“Р»Р°РІРЅР°СЏ',
      slug: '',
      isPublished: true,
      blocks: [
        { id: 'b_hero', type: 'hero', props: { mode: 'banner', bannerHeight: 220, headline: 'Р‘Р°РЅРµСЂ + Р›РѕРіРѕ', subline: '' } },
        {
          id: 'b_ai',
          type: 'ai_prompt',
          props: {
            title: 'AIChat',
            subtitle: 'Р’РІРµРґРёС‚Рµ РІР°С€Рё РїСЂРµРґРїРѕС‡С‚РµРЅРёСЏ Рё РР РїРѕРјРѕР¶РµС‚ РїРѕРґРѕР±СЂР°С‚СЊ РґР»СЏ Р’Р°СЃ РёРґРµР°Р»СЊРЅС‹Р№ РІР°СЂРёР°РЅС‚',
            placeholder: 'РЎРµРјРµР№РЅС‹Р№ Р°РІС‚РѕРјРѕР±РёР»СЊ, РІРЅРµРґРѕСЂРѕР¶РЅРёРє. РћС‚ 2020 РіРѕРґР° Рё РІС‹С€Рµ. РџРѕР»РЅР°СЏ РєРѕРјРїР»РµРєС‚Р°С†РёСЏвЂ¦',
            showButton: false,
            cta: 'РЎРїСЂРѕСЃРёС‚СЊ'
          }
        },
        { id: 'b_search', type: 'search_widget', props: { mode: 'prototype', title: 'Р Р°СЃС€РёСЂРµРЅРЅС‹Р№ РїРѕРёСЃРє', cta: 'РќР°Р№С‚Рё Р°РІС‚Рѕ' } },
        { id: 'b_strip', type: 'reels_strip', props: { title: 'Р›СѓС‡С€РёРµ AIClips', moreLabel: 'Р‘РѕР»СЊС€Рµ', moreHref: '/aiclips', showArrows: true } },
        { id: 'b_offers', type: 'car_grid', props: { title: 'РЎРїРµС†РёР°Р»СЊРЅС‹Рµ РїСЂРµРґР»РѕР¶РµРЅРёСЏ', limit: 9, variant: 'offers', moreLabel: 'Р‘РѕР»СЊС€Рµ', moreHref: '/search' } },
        { id: 'b_sell', type: 'cta_sell', props: { title: 'РџРѕРґР°Р№ РѕР±СЉСЏРІР»РµРЅРёРµ', text: '', cta: '+', href: '/sell', variant: 'plus_tile' } },
        { id: 'b_news', type: 'news_cards', props: { title: 'РќРѕРІРѕСЃС‚Рё AICar', limit: 1, variant: 'feature', moreLabel: 'Р‘РѕР»СЊС€Рµ РЅРѕРІРѕСЃС‚РµР№', moreHref: '/news' } }
      ]
    },
    {
      id: 'p_search',
      title: 'Р Р°СЃС€РёСЂРµРЅРЅС‹Р№ РїРѕРёСЃРє',
      slug: 'search',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Р Р°СЃС€РёСЂРµРЅРЅС‹Р№ РїРѕРёСЃРє' } },
        { id: 'b_search', type: 'search_widget', props: { mode: 'prototype', title: 'Р¤РёР»СЊС‚СЂС‹', cta: 'РќР°Р№С‚Рё' } },
        { id: 'b_hot', type: 'car_grid', props: { title: 'Р“РѕСЂСЏС‡РёРµ РїСЂРµРґР»РѕР¶РµРЅРёСЏ', limit: 6 } },
        { id: 'b_list', type: 'car_list', props: { title: 'Р РµР·СѓР»СЊС‚Р°С‚С‹', limit: 12 } }
      ]
    },
    {
      id: 'p_search2',
      title: 'Р Р°СЃС€РёСЂРµРЅРЅС‹Р№ РїРѕРёСЃРє (РІР°СЂРёР°РЅС‚ 2)',
      slug: 'search-v2',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Р Р°СЃС€РёСЂРµРЅРЅС‹Р№ РїРѕРёСЃРє вЂ” РІР°СЂРёР°РЅС‚ 2' } },
        { id: 'b_search', type: 'search_widget', props: { mode: 'prototype', title: 'Р¤РёР»СЊС‚СЂС‹', cta: 'РќР°Р№С‚Рё' } },
        { id: 'b_list', type: 'car_list', props: { title: 'Р РµР·СѓР»СЊС‚Р°С‚С‹', limit: 12, withSidebarHint: true } }
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
        { id: 'b_hero', type: 'hero', props: { headline: 'AIChat', subline: 'Р—Р°РґР°Р№ РІРѕРїСЂРѕСЃ Рё РїРѕР»СѓС‡Рё РїРѕРґР±РѕСЂ Р°РІС‚Рѕ Рё СЃРѕРІРµС‚С‹' } },
        { id: 'b_ai', type: 'ai_prompt', props: { placeholder: 'РќР°РїСЂРёРјРµСЂ: В«РљР°РєРѕР№ РєСЂРѕСЃСЃРѕРІРµСЂ Р»СѓС‡С€Рµ РґРѕ 15 000$?В»', cta: 'РЎРїСЂРѕСЃРёС‚СЊ' } },
        { id: 'b_faq', type: 'faq', props: { title: 'FAQ', limit: 6 } }
      ]
    },
    {
      id: 'p_news',
      title: 'РќРѕРІРѕСЃС‚Рё AICar',
      slug: 'news',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'РќРѕРІРѕСЃС‚Рё AICar', align: 'center' } },
        { id: 'b_news', type: 'news_cards', props: { title: '', limit: 6, variant: 'cards' } }
      ]
    },
    {
      id: 'p_sell',
      title: 'РџРѕРґР°С‡Р° РѕР±СЉСЏРІР»РµРЅРёСЏ',
      slug: 'sell',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'РџРѕРґР°С‡Р° РѕР±СЉСЏРІР»РµРЅРёСЏ' } },
        { id: 'b_spacer', type: 'spacer', props: { h: 12 } },
        { id: 'b_sell', type: 'cta_sell', props: { title: 'РђРЅРєРµС‚Р° РІ РґРµРјРѕ СѓРїСЂРѕС‰РµРЅР°', text: 'РќР° СЃР»РµРґСѓСЋС‰РµРј С€Р°РіРµ РґРѕР±Р°РІРёРј РїРѕР»РЅРѕС†РµРЅРЅСѓСЋ С„РѕСЂРјСѓ Рё РјРµРґРёР°-Р·Р°РіСЂСѓР·РєСѓ.', cta: 'РћРє', href: '/' } }
      ]
    },
    {
      id: 'p_car_detail_tpl',
      title: 'РЁР°Р±Р»РѕРЅ: РѕР±СЉСЏРІР»РµРЅРёРµ',
      slug: 'cars/[id]',
      isPublished: true,
      blocks: [
        { id: 'b_car', type: 'car_detail', props: { showAskAi: true, showLeadButton: true } },
        { id: 'b_sim', type: 'car_grid', props: { title: 'РџРѕС…РѕР¶РёРµ РѕР±СЉСЏРІР»РµРЅРёСЏ', limit: 6 } }
      ]
    }
  ],
  demoData: {
    cars: [
      { id: 'c1', title: 'Toyota Corolla', price: 9800, currency: '$', year: 2014, mileageKm: 165000, city: 'ChiИ™inДѓu', fuel: 'BenzinДѓ', gearbox: 'AT', imageUrl: img('corolla'), vehicleType: 'car' },
      { id: 'c2', title: 'BMW 3 Series', price: 13900, currency: '$', year: 2013, mileageKm: 190000, city: 'BДѓlИ›i', fuel: 'Diesel', gearbox: 'AT', imageUrl: img('bmw3'), vehicleType: 'car' },
      { id: 'c3', title: 'Volkswagen Passat', price: 11700, currency: '$', year: 2015, mileageKm: 175000, city: 'Cahul', fuel: 'Diesel', gearbox: 'MT', imageUrl: img('passat'), vehicleType: 'car' },
      { id: 'c4', title: 'Honda CR-V', price: 15800, currency: '$', year: 2012, mileageKm: 210000, city: 'Orhei', fuel: 'BenzinДѓ', gearbox: 'AT', imageUrl: img('crv'), vehicleType: 'car' },
      { id: 'c5', title: 'Skoda Octavia', price: 10500, currency: '$', year: 2016, mileageKm: 150000, city: 'ChiИ™inДѓu', fuel: 'BenzinДѓ', gearbox: 'MT', imageUrl: img('octavia'), vehicleType: 'car' },
      { id: 'c6', title: 'Mercedes C-Class', price: 16900, currency: '$', year: 2012, mileageKm: 220000, city: 'Ungheni', fuel: 'Diesel', gearbox: 'AT', imageUrl: img('cclass'), vehicleType: 'car' },
      { id: 'c7', title: 'Mazda 6', price: 12400, currency: '$', year: 2015, mileageKm: 160000, city: 'Soroca', fuel: 'BenzinДѓ', gearbox: 'AT', imageUrl: img('mazda6'), vehicleType: 'car' },
      { id: 'c8', title: 'Nissan Qashqai', price: 13200, currency: '$', year: 2016, mileageKm: 170000, city: 'ChiИ™inДѓu', fuel: 'Diesel', gearbox: 'MT', imageUrl: img('qashqai'), vehicleType: 'car' },
      { id: 'c9', title: 'Hyundai Tucson', price: 14500, currency: '$', year: 2017, mileageKm: 155000, city: 'ChiИ™inДѓu', fuel: 'BenzinДѓ', gearbox: 'AT', imageUrl: img('tucson'), vehicleType: 'car' },
      { id: 'c10', title: 'Ford Transit (van)', price: 12900, currency: '$', year: 2016, mileageKm: 210000, city: 'ChiИ™inДѓu', fuel: 'Diesel', gearbox: 'MT', imageUrl: img('transit'), vehicleType: 'bus' },
      { id: 'c11', title: 'MAN TGL (truck)', price: 18900, currency: '$', year: 2014, mileageKm: 350000, city: 'BДѓlИ›i', fuel: 'Diesel', gearbox: 'MT', imageUrl: img('man_tgl'), vehicleType: 'truck' },
      { id: 'c12', title: 'Yamaha MT-07', price: 6200, currency: '$', year: 2018, mileageKm: 24000, city: 'ChiИ™inДѓu', fuel: 'BenzinДѓ', gearbox: 'MT', imageUrl: img('mt07'), vehicleType: 'bike' }
    ],
    reels: [
      {
        id: 'r1',
        title: 'Corolla: РїР»СЋСЃС‹/РјРёРЅСѓСЃС‹',
        author: 'AICar',
        videoUrl: vid('1'),
        previewUrl: vid('p1'),
        posterUrl: img('reel1'),
        thumbUrl: img('reel1'),
        views: 12540,
        likes: 732,
        badges: ['Top'],
        linkedCarId: 'c1'
      },
      {
        id: 'r2',
        title: 'Passat: С‡С‚Рѕ РїСЂРѕРІРµСЂРёС‚СЊ',
        author: 'AICar',
        videoUrl: vid('2'),
        previewUrl: vid('p2'),
        posterUrl: img('reel2'),
        thumbUrl: img('reel2'),
        views: 9840,
        likes: 601,
        badges: ['AI'],
        linkedCarId: 'c3'
      },
      {
        id: 'r3',
        title: 'CRвЂ‘V РґР»СЏ СЃРµРјСЊРё',
        author: 'AICar',
        videoUrl: vid('3'),
        previewUrl: vid('p3'),
        posterUrl: img('reel3'),
        thumbUrl: img('reel3'),
        views: 14320,
        likes: 812,
        badges: ['Top', 'AI'],
        linkedCarId: 'c4'
      },
      {
        id: 'r4',
        title: 'Qashqai: С‡С‚Рѕ СЃРјРѕС‚СЂРµС‚СЊ',
        author: 'AICar',
        videoUrl: vid('4'),
        previewUrl: vid('p4'),
        posterUrl: img('reel4'),
        thumbUrl: img('reel4'),
        views: 7560,
        likes: 421,
        badges: [],
        linkedCarId: 'c8'
      },
      {
        id: 'r5',
        title: 'Tucson: Р±С‹СЃС‚СЂС‹Р№ РѕР±Р·РѕСЂ',
        author: 'AICar',
        videoUrl: vid('5'),
        previewUrl: vid('p5'),
        posterUrl: img('reel5'),
        thumbUrl: img('reel5'),
        views: 22110,
        likes: 1203,
        badges: ['Top'],
        linkedCarId: 'c9'
      },
      {
        id: 'r6',
        title: 'BMW 3: РЅР° С‡С‚Рѕ СЃРјРѕС‚СЂРµС‚СЊ',
        author: 'AICar',
        videoUrl: vid('6'),
        previewUrl: vid('p6'),
        posterUrl: img('reel6'),
        thumbUrl: img('reel6'),
        views: 16780,
        likes: 945,
        badges: ['AI'],
        linkedCarId: 'c2'
      },
      {
        id: 'r7',
        title: 'Transit: РІСЌРЅ РґР»СЏ Р±РёР·РЅРµСЃР°',
        author: 'AICar',
        videoUrl: vid('7'),
        previewUrl: vid('p7'),
        posterUrl: img('reel7'),
        thumbUrl: img('reel7'),
        views: 6420,
        likes: 288,
        badges: [],
        linkedCarId: 'c10'
      },
      {
        id: 'r8',
        title: 'MTвЂ‘07: Р·РІСѓРє Рё РґРёРЅР°РјРёРєР°',
        author: 'AICar',
        videoUrl: vid('8'),
        previewUrl: vid('p8'),
        posterUrl: img('reel8'),
        thumbUrl: img('reel8'),
        views: 9130,
        likes: 701,
        badges: ['Top'],
        linkedCarId: 'c12'
      }
    ],
    news: [
      { id: 'n1', title: 'РљР°Рє РІС‹Р±СЂР°С‚СЊ Р°РІС‚Рѕ РґРѕ $10k', excerpt: 'РљРѕСЂРѕС‚РєРёР№ С‡РµРє-Р»РёСЃС‚ РґР»СЏ СЂР°Р·СѓРјРЅРѕР№ РїРѕРєСѓРїРєРё.', imageUrl: img('news1') },
      { id: 'n2', title: 'РўРћРџ-5 РѕС€РёР±РѕРє РїСЂРё РїРѕРєСѓРїРєРµ', excerpt: 'РќР° С‡С‚Рѕ Р»СЋРґРё С‡Р°С‰Рµ РІСЃРµРіРѕ РЅРµ РѕР±СЂР°С‰Р°СЋС‚ РІРЅРёРјР°РЅРёРµ.', imageUrl: img('news2') },
      { id: 'n3', title: 'РџРѕС‡РµРјСѓ РІР°Р¶РЅР° РґРёР°РіРЅРѕСЃС‚РёРєР°', excerpt: 'Р РєР°Рє РЅРµ РїРѕРїР°СЃС‚СЊ РЅР° СЂРµРјРѕРЅС‚.', imageUrl: img('news3') }
    ],
    faq: [
      { id: 'f1', q: 'Р§С‚Рѕ С‚Р°РєРѕРµ AIChat?', a: 'Р­С‚Рѕ AI-РєРѕРЅСЃСѓР»СЊС‚Р°РЅС‚, РєРѕС‚РѕСЂС‹Р№ РїРѕРјРѕРіР°РµС‚ РїРѕРґРѕР±СЂР°С‚СЊ Р°РІС‚Рѕ Рё РѕР±СЉСЏСЃРЅСЏРµС‚ РЅСЋР°РЅСЃС‹.' },
      { id: 'f2', q: 'AIChat РІРёРґРёС‚ СЂРµР°Р»СЊРЅС‹Рµ РѕР±СЉСЏРІР»РµРЅРёСЏ?', a: 'Р’ РґРµРјРѕ вЂ” РґР°, РёР· РјРѕРє-РґР°РЅРЅС‹С…. Р’ РїСЂРѕРґРµ вЂ” Р±СѓРґРµС‚ Р±СЂР°С‚СЊ РёР· Р±Р°Р·С‹ РѕР±СЉСЏРІР»РµРЅРёР№.' },
      { id: 'f3', q: 'РњРѕР¶РЅРѕ Р»Рё РїСЂРѕРґР°РІР°С‚СЊ Р°РІС‚Рѕ?', a: 'Р”Р°, С‡РµСЂРµР· СЂР°Р·РґРµР» В«РџРѕРґР°С‚СЊ РѕР±СЉСЏРІР»РµРЅРёРµВ».' },
      { id: 'f4', q: 'Р§С‚Рѕ С‚Р°РєРѕРµ AIClips?', a: 'РљРѕСЂРѕС‚РєРёРµ РІРёРґРµРѕ-РѕР±Р·РѕСЂС‹ РїРѕ РјРѕРґРµР»СЏРј, РїРѕС…РѕР¶РёРµ РЅР° Reels.' },
      { id: 'f5', q: 'Р‘СѓРґРµС‚ Р»Рё РјРѕРґРµСЂР°С†РёСЏ?', a: 'Р”Р°, РєРѕРЅС‚РµРЅС‚ Рё РѕР±СЉСЏРІР»РµРЅРёСЏ Р±СѓРґСѓС‚ РїСЂРѕС…РѕРґРёС‚СЊ РјРѕРґРµСЂР°С†РёСЋ.' },
      { id: 'f6', q: 'РљРѕРіРґР° Р±СѓРґРµС‚ РїСЂРѕРґ?', a: 'РџРѕСЃР»Рµ РґРµРјРѕ вЂ” РїРµСЂРµРЅРѕСЃ РЅР° РїСЂРѕРґРѕРІСѓСЋ РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂСѓ (Р‘Р”, РјРµРґРёР°, AI RAG).' }
    ]
  }
};
