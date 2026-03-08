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
  demoData: {
    cars: [
      {
        id: 'c1',
        title: 'Toyota Corolla',
        price: 10200,
        currency: '$',
        year: 2019,
        mileageKm: 78000,
        city: 'ChiРв„ўinР”С“u',
        fuel: 'BenzinР”С“',
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
        city: 'BР”С“lРвЂєi',
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
        city: 'ChiРв„ўinР”С“u',
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
        fuel: 'BenzinР”С“',
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
        fuel: 'BenzinР”С“',
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
        city: 'ChiРв„ўinР”С“u',
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
        fuel: 'BenzinР”С“',
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
        fuel: 'BenzinР”С“',
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
        city: 'ChiРв„ўinР”С“u',
        fuel: 'BenzinР”С“',
        gearbox: 'AT',
        imageUrl: img('tucson'),
        vehicleType: 'car'
      }
    ],
    reels: [
      {
        id: 'r1',
        title: 'Corolla: Р С—Р В»РЎР‹РЎРѓРЎвЂ№/Р СР С‘Р Р…РЎС“РЎРѓРЎвЂ№',
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
        title: 'Passat: РЎвЂЎРЎвЂљР С• Р С—РЎР‚Р С•Р Р†Р ВµРЎР‚Р С‘РЎвЂљРЎРЉ',
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
        title: 'CRРІР‚вЂV Р Т‘Р В»РЎРЏ РЎРѓР ВµР СРЎРЉР С‘',
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
        q: 'Р В­РЎвЂљР С• РЎР‚Р ВµР В°Р В»РЎРЉР Р…РЎвЂ№Р в„– Р СР В°РЎР‚Р С”Р ВµРЎвЂљР С—Р В»Р ВµР в„–РЎРѓ?',
        a: 'Р СњР ВµРЎвЂљ, РЎРЊРЎвЂљР С• Р Т‘Р ВµР СР С•: Р Т‘Р В°Р Р…Р Р…РЎвЂ№Р Вµ Р С‘ Р СР ВµР Т‘Р С‘Р В° Р В·Р В°Р СР С•Р С”Р В°Р Р…РЎвЂ№. Р вЂ™ Р С—РЎР‚Р С•Р Т‘Р Вµ Р В±РЎС“Р Т‘Р ВµРЎвЂљ Р С—Р С•Р Т‘Р С”Р В»РЎР‹РЎвЂЎР ВµР Р…Р С‘Р Вµ Р С” Р вЂР вЂќ, Р С•Р С—Р В»Р В°РЎвЂљР В°Р С Р С‘ Р СР С•Р Т‘Р ВµРЎР‚Р В°РЎвЂ Р С‘Р С‘.'
      },
      { q: 'Р СљР С•Р В¶Р Р…Р С• Р В»Р С‘ Р С—РЎР‚Р С•Р Т‘Р В°Р Р†Р В°РЎвЂљРЎРЉ Р В°Р Р†РЎвЂљР С•?', a: 'Р вЂ™ Р Т‘Р ВµР СР С• РІР‚вЂќ РЎвЂљР С•Р В»РЎРЉР С”Р С• Р Р†Р С‘Р В·РЎС“Р В°Р В»РЎРЉР Р…Р С•. Р вЂ™ Р С—РЎР‚Р С•Р Т‘Р Вµ Р С—Р С•РЎРЏР Р†РЎРЏРЎвЂљРЎРѓРЎРЏ РЎР‚Р С•Р В»Р С‘, РЎРѓРЎвЂљР В°РЎвЂљРЎС“РЎРѓРЎвЂ№ Р С‘ Р С—РЎС“Р В±Р В»Р С‘Р С”Р В°РЎвЂ Р С‘РЎРЏ.' },
      {
        q: 'Р В§РЎвЂљР С• РЎвЂљР В°Р С”Р С•Р Вµ AIChat?',
        a: 'Р С™Р С•Р Р…РЎРѓРЎС“Р В»РЎРЉРЎвЂљР В°Р Р…РЎвЂљ, Р С”Р С•РЎвЂљР С•РЎР‚РЎвЂ№Р в„– Р С—Р С•Р СР С•Р С–Р В°Р ВµРЎвЂљ Р С—Р С•Р Т‘Р С•Р В±РЎР‚Р В°РЎвЂљРЎРЉ Р В°Р Р†РЎвЂљР С• Р С—Р С• Р В±РЎР‹Р Т‘Р В¶Р ВµРЎвЂљРЎС“ Р С‘ Р С—РЎР‚Р ВµР Т‘Р С—Р С•РЎвЂЎРЎвЂљР ВµР Р…Р С‘РЎРЏР С, Р В° РЎвЂљР В°Р С”Р В¶Р Вµ Р С•Р В±РЎР‰РЎРЏРЎРѓР Р…РЎРЏР ВµРЎвЂљ Р Р…РЎР‹Р В°Р Р…РЎРѓРЎвЂ№ Р Р†РЎвЂ№Р В±Р С•РЎР‚Р В°.'
      },
      {
        q: 'AIClips РІР‚вЂќ РЎРЊРЎвЂљР С• Р С”Р В°Р С” Reels?',
        a: 'Р вЂќР В°: Р С”Р С•РЎР‚Р С•РЎвЂљР С”Р С‘Р Вµ Р Р†Р С‘Р Т‘Р ВµР С• РЎРѓ Р С—РЎР‚Р ВµР Р†РЎРЉРЎР‹, Р В»Р В°Р в„–Р С”Р В°Р СР С‘/Р С—РЎР‚Р С•РЎРѓР СР С•РЎвЂљРЎР‚Р В°Р СР С‘ Р С‘ Р С—Р ВµРЎР‚Р ВµРЎвЂ¦Р С•Р Т‘Р С•Р С Р Р…Р В° Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘Р Вµ.'
      },
      { q: 'Р вЂўРЎРѓРЎвЂљРЎРЉ Р В»Р С‘ Р В°Р Т‘Р СР С‘Р Р…Р С”Р В°?', a: 'Р вЂќР В°, Tilda-like builder (Р Т‘Р ВµР СР С•) Р Т‘Р В»РЎРЏ Р С—РЎР‚Р В°Р Р†Р С”Р С‘ РЎРѓРЎвЂљРЎР‚Р В°Р Р…Р С‘РЎвЂ , Р СР ВµР Р…РЎР‹ Р С‘ РЎвЂћРЎС“РЎвЂљР ВµРЎР‚Р В°.' },
      {
        q: 'Р СџР С•РЎвЂЎР ВµР СРЎС“ РЎвЂЎР В°РЎРѓРЎвЂљРЎРЉ РЎвЂћРЎС“Р Р…Р С”РЎвЂ Р С‘Р в„– Р Р…Р ВµР Т‘Р С•РЎРѓРЎвЂљРЎС“Р С—Р Р…Р В°?',
        a: 'Р вЂќР ВµР СР С• РЎвЂћР С•Р С”РЎС“РЎРѓР С‘РЎР‚РЎС“Р ВµРЎвЂљРЎРѓРЎРЏ Р Р…Р В° UX Р С‘ РЎРѓРЎвЂ Р ВµР Р…Р В°РЎР‚Р С‘РЎРЏРЎвЂ¦. Р вЂєР С•Р С–Р С‘Р С”РЎС“ Р С•Р С—Р В»Р В°РЎвЂљРЎвЂ№/Р Т‘Р С•РЎРѓРЎвЂљР В°Р Р†Р С”Р С‘/Р СР ВµР Т‘Р С‘Р В° Р В·Р В°Р С–РЎР‚РЎС“Р В·Р С”Р С‘ Р Т‘Р С•Р В±Р В°Р Р†Р С‘Р С Р Р…Р В° РЎРЊРЎвЂљР В°Р С—Р Вµ Р С—РЎР‚Р С•Р Т‘-Р В°Р Т‘Р В°Р С—РЎвЂљР В°РЎвЂ Р С‘Р С‘.'
      }
    ],
    news: [
      {
        id: 'n1',
        title: 'Р С›Р С—Р С‘РЎРѓР В°Р Р…Р С‘Р Вµ Р Р…Р С•Р Р†Р С•РЎРѓРЎвЂљР С‘',
        excerpt: 'Р С™Р С•РЎР‚Р С•РЎвЂљР С”Р С‘Р в„– РЎвЂЎР ВµР С”РІР‚вЂР В»Р С‘РЎРѓРЎвЂљ Р Т‘Р В»РЎРЏ РЎР‚Р В°Р В·РЎС“Р СР Р…Р С•Р в„– Р С—Р С•Р С”РЎС“Р С—Р С”Р С‘.',
        imageUrl: '',
        href: '/news'
      }
    ]
  },
  pages: [
    {
      id: 'p_home',
      title: 'Р вЂњР В»Р В°Р Р†Р Р…Р В°РЎРЏ',
      slug: '',
      isPublished: true,
      blocks: [
        {
          id: 'b_hero',
          type: 'hero',
          props: {
            mode: 'banner',
            bannerHeight: 220,
            headline: 'Р вЂР В°Р Р…Р Р…Р ВµРЎР‚ + Р вЂєР С•Р С–Р С•',
            subline: '',
            bgImage: ''
          }
        },
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
        {
          id: 'b_search',
          type: 'search_widget',
          props: {
            mode: 'prototype',
            title: 'Р В Р В°РЎРѓРЎв‚¬Р С‘РЎР‚Р ВµР Р…Р Р…РЎвЂ№Р в„– Р С—Р С•Р С‘РЎРѓР С”',
            cta: 'Р СњР В°Р в„–РЎвЂљР С‘ Р В°Р Р†РЎвЂљР С•'
          }
        },
        {
          id: 'b_strip',
          type: 'reels_strip',
          props: {
            title: 'Р вЂєРЎС“РЎвЂЎРЎв‚¬Р С‘Р Вµ AIClips',
            moreLabel: 'Р вЂР С•Р В»РЎРЉРЎв‚¬Р Вµ',
            moreHref: '/aiclips',
            showArrows: true
          }
        },
        {
          id: 'b_offers',
          type: 'car_grid',
          props: {
            title: 'Р РЋР С—Р ВµРЎвЂ Р С‘Р В°Р В»РЎРЉР Р…РЎвЂ№Р Вµ Р С—РЎР‚Р ВµР Т‘Р В»Р С•Р В¶Р ВµР Р…Р С‘РЎРЏ',
            limit: 9,
            variant: 'offers',
            moreLabel: 'Р вЂР С•Р В»РЎРЉРЎв‚¬Р Вµ',
            moreHref: '/search'
          }
        },
        {
          id: 'b_sell',
          type: 'cta_sell',
          props: {
            title: 'Р СџР С•Р Т‘Р В°Р в„– Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘Р Вµ',
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
            title: 'Р СњР С•Р Р†Р С•РЎРѓРЎвЂљР С‘ AICar',
            limit: 1,
            variant: 'feature',
            moreLabel: 'Р вЂР С•Р В»РЎРЉРЎв‚¬Р Вµ Р Р…Р С•Р Р†Р С•РЎРѓРЎвЂљР ВµР в„–',
            moreHref: '/news'
          }
        }
      ]
    },
    {
      id: 'p_search',
      title: 'Р В Р В°РЎРѓРЎв‚¬Р С‘РЎР‚Р ВµР Р…Р Р…РЎвЂ№Р в„– Р С—Р С•Р С‘РЎРѓР С”',
      slug: 'search',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Р В Р В°РЎРѓРЎв‚¬Р С‘РЎР‚Р ВµР Р…Р Р…РЎвЂ№Р в„– Р С—Р С•Р С‘РЎРѓР С”', align: 'center' } },
        { id: 'b_search', type: 'search_widget', props: { mode: 'prototype', title: '', cta: 'Р СњР В°Р в„–РЎвЂљР С‘ Р В°Р Р†РЎвЂљР С•' } },
        { id: 'b_list', type: 'car_list', props: { title: 'Р В Р ВµР В·РЎС“Р В»РЎРЉРЎвЂљР В°РЎвЂљРЎвЂ№', limit: 12 } }
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
      title: 'Р СџР С•Р Т‘Р В°РЎвЂљРЎРЉ Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘Р Вµ',
      slug: 'sell',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Р СџР С•Р Т‘Р В°РЎвЂљРЎРЉ Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘Р Вµ', align: 'center' } },
        { id: 'b_cta', type: 'cta_sell', props: { title: 'Р СџР С•Р Т‘Р В°Р в„– Р С•Р В±РЎР‰РЎРЏР Р†Р В»Р ВµР Р…Р С‘Р Вµ', cta: '+', href: '/sell', variant: 'plus_tile' } }
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
      id: 'p_about',
      title: 'Р С› Р С—РЎР‚Р С•Р ВµР С”РЎвЂљР Вµ',
      slug: 'about',
      isPublished: true,
      blocks: [{ id: 'b_title', type: 'section_title', props: { title: 'Р С› Р С—РЎР‚Р С•Р ВµР С”РЎвЂљР Вµ', align: 'center' } }]
    },
    {
      id: 'p_contacts',
      title: 'Р С™Р С•Р Р…РЎвЂљР В°Р С”РЎвЂљРЎвЂ№',
      slug: 'contacts',
      isPublished: true,
      blocks: [{ id: 'b_title', type: 'section_title', props: { title: 'Р С™Р С•Р Р…РЎвЂљР В°Р С”РЎвЂљРЎвЂ№', align: 'center' } }]
    },
    {
      id: 'p_privacy',
      title: 'Р СџР С•Р В»Р С‘РЎвЂљР С‘Р С”Р В°',
      slug: 'privacy',
      isPublished: true,
      blocks: [{ id: 'b_title', type: 'section_title', props: { title: 'Р СџР С•Р В»Р С‘РЎвЂљР С‘Р С”Р В°', align: 'center' } }]
    },
    {
      id: 'p_terms',
      title: 'Р Р€РЎРѓР В»Р С•Р Р†Р С‘РЎРЏ',
      slug: 'terms',
      isPublished: true,
      blocks: [{ id: 'b_title', type: 'section_title', props: { title: 'Р Р€РЎРѓР В»Р С•Р Р†Р С‘РЎРЏ', align: 'center' } }]
    }
  ]
};
