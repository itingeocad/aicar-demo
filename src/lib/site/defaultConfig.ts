import type { SiteConfig } from './types';

// NOTE: Keep this file UTF-8 (no BOM). Cyrillic text is expected.

const img = (seed: string) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;
const reelPoster = (seed: string) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/1600`;

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  version: '0.1.17',
  theme: {
    brandName: 'AICar',
    accent: 'slate',
    headerBg: 'slate-200'
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
  demoData: {
    cars: [
      {
        id: 'c1',
        title: 'Toyota Corolla',
        price: 10200,
        currency: '$',
        year: 2019,
        mileageKm: 78000,
        city: 'ChiИ™inДѓu',
        fuel: 'BenzinДѓ',
        gearbox: 'AT',
        imageUrl: img('corolla'),
        vehicleType: 'car'
      },
      {
        id: 'c2',
        title: 'BMW 3 Series',
        price: 18500,
        currency: '$',
        year: 2018,
        mileageKm: 98000,
        city: 'BДѓlИ›i',
        fuel: 'Diesel',
        gearbox: 'AT',
        imageUrl: img('bmw3'),
        vehicleType: 'car'
      },
      {
        id: 'c3',
        title: 'Volkswagen Passat',
        price: 12900,
        currency: '$',
        year: 2017,
        mileageKm: 146000,
        city: 'ChiИ™inДѓu',
        fuel: 'Diesel',
        gearbox: 'MT',
        imageUrl: img('passat'),
        vehicleType: 'car'
      },
      {
        id: 'c4',
        title: 'Honda CR-V',
        price: 21400,
        currency: '$',
        year: 2020,
        mileageKm: 54000,
        city: 'Cahul',
        fuel: 'BenzinДѓ',
        gearbox: 'AT',
        imageUrl: img('crv'),
        vehicleType: 'car'
      },
      {
        id: 'c5',
        title: 'Skoda Octavia',
        price: 11800,
        currency: '$',
        year: 2018,
        mileageKm: 112000,
        city: 'Orhei',
        fuel: 'BenzinДѓ',
        gearbox: 'MT',
        imageUrl: img('octavia'),
        vehicleType: 'car'
      },
      {
        id: 'c6',
        title: 'Mercedes C-Class',
        price: 23900,
        currency: '$',
        year: 2019,
        mileageKm: 86000,
        city: 'ChiИ™inДѓu',
        fuel: 'Diesel',
        gearbox: 'AT',
        imageUrl: img('cclass'),
        vehicleType: 'car'
      },
      {
        id: 'c7',
        title: 'Mazda 6',
        price: 14900,
        currency: '$',
        year: 2017,
        mileageKm: 121000,
        city: 'Soroca',
        fuel: 'BenzinДѓ',
        gearbox: 'AT',
        imageUrl: img('mazda6'),
        vehicleType: 'car'
      },
      {
        id: 'c8',
        title: 'Nissan Qashqai',
        price: 16700,
        currency: '$',
        year: 2020,
        mileageKm: 69000,
        city: 'Ungheni',
        fuel: 'BenzinДѓ',
        gearbox: 'AT',
        imageUrl: img('qashqai'),
        vehicleType: 'car'
      },
      {
        id: 'c9',
        title: 'Hyundai Tucson',
        price: 19800,
        currency: '$',
        year: 2021,
        mileageKm: 42000,
        city: 'ChiИ™inДѓu',
        fuel: 'BenzinДѓ',
        gearbox: 'AT',
        imageUrl: img('tucson'),
        vehicleType: 'car'
      }
    ],
    reels: [
      {
        id: 'r1',
        title: 'Corolla: РїР»СЋСЃС‹/РјРёРЅСѓСЃС‹',
        author: 'AICar',
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?seed=1',
        previewUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?seed=p1',
        posterUrl: reelPoster('reel1'),
        thumbUrl: reelPoster('reel1'),
        views: 12540,
        likes: 732,
        badges: ['Top'],
        linkedCarId: 'c1'
      },
      {
        id: 'r2',
        title: 'Passat: С‡С‚Рѕ РїСЂРѕРІРµСЂРёС‚СЊ',
        author: 'AICar',
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?seed=2',
        previewUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?seed=p2',
        posterUrl: reelPoster('reel2'),
        thumbUrl: reelPoster('reel2'),
        views: 9840,
        likes: 601,
        badges: ['AI'],
        linkedCarId: 'c3'
      },
      {
        id: 'r3',
        title: 'CRвЂ‘V РґР»СЏ СЃРµРјСЊРё',
        author: 'AICar',
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?seed=3',
        previewUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?seed=p3',
        posterUrl: reelPoster('reel3'),
        thumbUrl: reelPoster('reel3'),
        views: 14320,
        likes: 812,
        badges: ['Top', 'AI'],
        linkedCarId: 'c4'
      }
    ],
    faq: [
      {
        q: 'Р­С‚Рѕ СЂРµР°Р»СЊРЅС‹Р№ РјР°СЂРєРµС‚РїР»РµР№СЃ?',
        a: 'РќРµС‚, СЌС‚Рѕ РґРµРјРѕ: РґР°РЅРЅС‹Рµ Рё РјРµРґРёР° Р·Р°РјРѕРєР°РЅС‹. Р’ РїСЂРѕРґРµ Р±СѓРґРµС‚ РїРѕРґРєР»СЋС‡РµРЅРёРµ Рє Р‘Р”, РѕРїР»Р°С‚Р°Рј Рё РјРѕРґРµСЂР°С†РёРё.'
      },
      { q: 'РњРѕР¶РЅРѕ Р»Рё РїСЂРѕРґР°РІР°С‚СЊ Р°РІС‚Рѕ?', a: 'Р’ РґРµРјРѕ вЂ” С‚РѕР»СЊРєРѕ РІРёР·СѓР°Р»СЊРЅРѕ. Р’ РїСЂРѕРґРµ РїРѕСЏРІСЏС‚СЃСЏ СЂРѕР»Рё, СЃС‚Р°С‚СѓСЃС‹ Рё РїСѓР±Р»РёРєР°С†РёСЏ.' },
      {
        q: 'Р§С‚Рѕ С‚Р°РєРѕРµ AIChat?',
        a: 'РљРѕРЅСЃСѓР»СЊС‚Р°РЅС‚, РєРѕС‚РѕСЂС‹Р№ РїРѕРјРѕРіР°РµС‚ РїРѕРґРѕР±СЂР°С‚СЊ Р°РІС‚Рѕ РїРѕ Р±СЋРґР¶РµС‚Сѓ Рё РїСЂРµРґРїРѕС‡С‚РµРЅРёСЏРј, Р° С‚Р°РєР¶Рµ РѕР±СЉСЏСЃРЅСЏРµС‚ РЅСЋР°РЅСЃС‹ РІС‹Р±РѕСЂР°.'
      },
      {
        q: 'AIClips вЂ” СЌС‚Рѕ РєР°Рє Reels?',
        a: 'Р”Р°: РєРѕСЂРѕС‚РєРёРµ РІРёРґРµРѕ СЃ РїСЂРµРІСЊСЋ, Р»Р°Р№РєР°РјРё/РїСЂРѕСЃРјРѕС‚СЂР°РјРё Рё РїРµСЂРµС…РѕРґРѕРј РЅР° РѕР±СЉСЏРІР»РµРЅРёРµ.'
      },
      { q: 'Р•СЃС‚СЊ Р»Рё Р°РґРјРёРЅРєР°?', a: 'Р”Р°, Tilda-like builder (РґРµРјРѕ) РґР»СЏ РїСЂР°РІРєРё СЃС‚СЂР°РЅРёС†, РјРµРЅСЋ Рё С„СѓС‚РµСЂР°.' },
      {
        q: 'РџРѕС‡РµРјСѓ С‡Р°СЃС‚СЊ С„СѓРЅРєС†РёР№ РЅРµРґРѕСЃС‚СѓРїРЅР°?',
        a: 'Р”РµРјРѕ С„РѕРєСѓСЃРёСЂСѓРµС‚СЃСЏ РЅР° UX Рё СЃС†РµРЅР°СЂРёСЏС…. Р›РѕРіРёРєСѓ РѕРїР»Р°С‚С‹/РґРѕСЃС‚Р°РІРєРё/РјРµРґРёР° Р·Р°РіСЂСѓР·РєРё РґРѕР±Р°РІРёРј РЅР° СЌС‚Р°РїРµ РїСЂРѕРґ-Р°РґР°РїС‚Р°С†РёРё.'
      }
    ],
    news: [
      {
        id: 'n1',
        title: 'РћРїРёСЃР°РЅРёРµ РЅРѕРІРѕСЃС‚Рё',
        excerpt: 'РљРѕСЂРѕС‚РєРёР№ С‡РµРєвЂ‘Р»РёСЃС‚ РґР»СЏ СЂР°Р·СѓРјРЅРѕР№ РїРѕРєСѓРїРєРё.',
        imageUrl: '',
        href: '/news'
      }
    ]
  },
  pages: [
    {
      id: 'p_home',
      title: 'Р“Р»Р°РІРЅР°СЏ',
      slug: '',
      isPublished: true,
      blocks: [
        {
          id: 'b_hero',
          type: 'hero',
          props: {
            mode: 'banner',
            bannerHeight: 220,
            headline: 'Р‘Р°РЅРЅРµСЂ + Р›РѕРіРѕ',
            subline: '',
            bgImage: ''
          }
        },
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
        {
          id: 'b_search',
          type: 'search_widget',
          props: {
            mode: 'prototype',
            title: 'Р Р°СЃС€РёСЂРµРЅРЅС‹Р№ РїРѕРёСЃРє',
            cta: 'РќР°Р№С‚Рё Р°РІС‚Рѕ'
          }
        },
        {
          id: 'b_strip',
          type: 'reels_strip',
          props: {
            title: 'Р›СѓС‡С€РёРµ AIClips',
            moreLabel: 'Р‘РѕР»СЊС€Рµ',
            moreHref: '/aiclips',
            showArrows: true
          }
        },
        {
          id: 'b_offers',
          type: 'car_grid',
          props: {
            title: 'РЎРїРµС†РёР°Р»СЊРЅС‹Рµ РїСЂРµРґР»РѕР¶РµРЅРёСЏ',
            limit: 9,
            variant: 'offers',
            moreLabel: 'Р‘РѕР»СЊС€Рµ',
            moreHref: '/search'
          }
        },
        {
          id: 'b_sell',
          type: 'cta_sell',
          props: {
            title: 'РџРѕРґР°Р№ РѕР±СЉСЏРІР»РµРЅРёРµ',
            text: '',
            cta: '+',
            href: '/sell',
            variant: 'plus_tile'
          }
        },
        {
          id: 'b_news',
          type: 'news_cards',
          props: {
            title: 'РќРѕРІРѕСЃС‚Рё AICar',
            limit: 1,
            variant: 'feature',
            moreLabel: 'Р‘РѕР»СЊС€Рµ РЅРѕРІРѕСЃС‚РµР№',
            moreHref: '/news'
          }
        }
      ]
    },
    {
      id: 'p_search',
      title: 'Р Р°СЃС€РёСЂРµРЅРЅС‹Р№ РїРѕРёСЃРє',
      slug: 'search',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Р Р°СЃС€РёСЂРµРЅРЅС‹Р№ РїРѕРёСЃРє', align: 'center' } },
        { id: 'b_search', type: 'search_widget', props: { mode: 'prototype', title: '', cta: 'РќР°Р№С‚Рё Р°РІС‚Рѕ' } },
        { id: 'b_list', type: 'car_list', props: { title: 'Р РµР·СѓР»СЊС‚Р°С‚С‹', limit: 12 } }
      ]
    },
    {
      id: 'p_aiclips',
      title: 'AIClips',
      slug: 'aiclips',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'AIClips', align: 'center' } },
        { id: 'b_view', type: 'reels_viewer', props: { title: 'AIClips' } }
      ]
    },
    {
      id: 'p_aichat',
      title: 'AIChat',
      slug: 'aichat',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'AIChat', align: 'center' } },
        { id: 'b_faq', type: 'faq', props: { title: 'FAQ', limit: 6 } }
      ]
    },
    {
      id: 'p_sell',
      title: 'РџРѕРґР°С‚СЊ РѕР±СЉСЏРІР»РµРЅРёРµ',
      slug: 'sell',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'РџРѕРґР°С‚СЊ РѕР±СЉСЏРІР»РµРЅРёРµ', align: 'center' } },
        { id: 'b_cta', type: 'cta_sell', props: { title: 'РџРѕРґР°Р№ РѕР±СЉСЏРІР»РµРЅРёРµ', cta: '+', href: '/sell', variant: 'plus_tile' } }
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
      id: 'p_about',
      title: 'Рћ РїСЂРѕРµРєС‚Рµ',
      slug: 'about',
      isPublished: true,
      blocks: [{ id: 'b_title', type: 'section_title', props: { title: 'Рћ РїСЂРѕРµРєС‚Рµ', align: 'center' } }]
    },
    {
      id: 'p_contacts',
      title: 'РљРѕРЅС‚Р°РєС‚С‹',
      slug: 'contacts',
      isPublished: true,
      blocks: [{ id: 'b_title', type: 'section_title', props: { title: 'РљРѕРЅС‚Р°РєС‚С‹', align: 'center' } }]
    },
    {
      id: 'p_privacy',
      title: 'РџРѕР»РёС‚РёРєР°',
      slug: 'privacy',
      isPublished: true,
      blocks: [{ id: 'b_title', type: 'section_title', props: { title: 'РџРѕР»РёС‚РёРєР°', align: 'center' } }]
    },
    {
      id: 'p_terms',
      title: 'РЈСЃР»РѕРІРёСЏ',
      slug: 'terms',
      isPublished: true,
      blocks: [{ id: 'b_title', type: 'section_title', props: { title: 'РЈСЃР»РѕРІРёСЏ', align: 'center' } }]
    }
  ]
};
