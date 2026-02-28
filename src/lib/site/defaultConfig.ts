import { SiteConfig } from './types';

function img(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;
}

function vid(seed: string) {
  // demo-friendly public mp4. You can replace later with S3/CDN.
  return `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4?seed=${encodeURIComponent(seed)}`;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  version: '0.1.0',
  theme: {
    brandName: 'AICar',
    accent: 'indigo'
  },
  nav: {
    items: [
      { label: 'Авто', href: '/search' },
      { label: 'AIClips', href: '/aiclips' },
      { label: 'AIChat', href: '/aichat' }
    ]
  },
  footer: {
    links: [
      { label: 'О проекте', href: '/about' },
      { label: 'Политика', href: '/privacy' },
      { label: 'Контакты', href: '/contacts' }
    ],
    note: 'Demo build • контент и медиа могут быть моковыми'
  },
  pages: [
    {
      id: 'p_home',
      title: 'Главная',
      slug: '',
      isPublished: true,
      blocks: [
        { id: 'b_hero', type: 'hero', props: { headline: 'AICar — умный выбор авто', subline: 'Подбор, объявления, AIClips и AIChat в одном месте' } },
        { id: 'b_ai', type: 'ai_prompt', props: { placeholder: 'Спроси AI: «Подбери авто до 10 000$ для семьи…»', cta: 'Спросить' } },
        { id: 'b_search', type: 'search_widget', props: { title: 'Расширенный поиск', cta: 'Найти автомобиль' } },
        { id: 'b_strip', type: 'reels_strip', props: { title: 'Лучшие AIClips' } },
        { id: 'b_offers', type: 'car_grid', props: { title: 'Специальные предложения', limit: 6 } },
        { id: 'b_sell', type: 'cta_sell', props: { title: 'Подать объявление', text: 'Быстро разместите авто и получите заявки.', cta: 'Подать объявление', href: '/sell' } },
        { id: 'b_news', type: 'news_cards', props: { title: 'Новости и обзоры', limit: 3 } }
      ]
    },
    {
      id: 'p_search',
      title: 'Расширенный поиск',
      slug: 'search',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Расширенный поиск' } },
        { id: 'b_search', type: 'search_widget', props: { title: 'Фильтры', cta: 'Найти' } },
        { id: 'b_hot', type: 'car_grid', props: { title: 'Горячие предложения', limit: 4 } },
        { id: 'b_list', type: 'car_list', props: { title: 'Результаты', limit: 10 } }
      ]
    },
    {
      id: 'p_search2',
      title: 'Расширенный поиск (вариант 2)',
      slug: 'search-v2',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Расширенный поиск — вариант 2' } },
        { id: 'b_search', type: 'search_widget', props: { title: 'Фильтры', cta: 'Найти' } },
        { id: 'b_list', type: 'car_list', props: { title: 'Результаты', limit: 12, withSidebarHint: true } }
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
        { id: 'b_hero', type: 'hero', props: { headline: 'AIChat', subline: 'Задай вопрос и получи подбор авто и советы' } },
        { id: 'b_ai', type: 'ai_prompt', props: { placeholder: 'Например: «Какой кроссовер лучше до 15 000$?»', cta: 'Спросить' } },
        { id: 'b_faq', type: 'faq', props: { title: 'FAQ', limit: 6 } }
      ]
    },
    {
      id: 'p_sell',
      title: 'Подача объявления',
      slug: 'sell',
      isPublished: true,
      blocks: [
        { id: 'b_title', type: 'section_title', props: { title: 'Подача объявления' } },
        { id: 'b_spacer', type: 'spacer', props: { h: 12 } },
        { id: 'b_sell', type: 'cta_sell', props: { title: 'Анкета в демо упрощена', text: 'На следующем шаге добавим полноценную форму и медиа-загрузку.', cta: 'Ок', href: '/' } }
      ]
    },
    {
      id: 'p_car_detail_tpl',
      title: 'Шаблон: объявление',
      slug: 'cars/[id]',
      isPublished: true,
      blocks: [
        { id: 'b_car', type: 'car_detail', props: { showAskAi: true, showLeadButton: true } },
        { id: 'b_sim', type: 'car_grid', props: { title: 'Похожие объявления', limit: 4 } }
      ]
    }
  ],
  demoData: {
    cars: [
      { id: 'c1', title: 'Toyota Corolla', price: 9800, currency: '$', year: 2014, mileageKm: 165000, city: 'Chișinău', fuel: 'Benzină', gearbox: 'AT', imageUrl: img('corolla') },
      { id: 'c2', title: 'BMW 3 Series', price: 13900, currency: '$', year: 2013, mileageKm: 190000, city: 'Bălți', fuel: 'Diesel', gearbox: 'AT', imageUrl: img('bmw3') },
      { id: 'c3', title: 'Volkswagen Passat', price: 11700, currency: '$', year: 2015, mileageKm: 175000, city: 'Cahul', fuel: 'Diesel', gearbox: 'MT', imageUrl: img('passat') },
      { id: 'c4', title: 'Honda CR-V', price: 15800, currency: '$', year: 2012, mileageKm: 210000, city: 'Orhei', fuel: 'Benzină', gearbox: 'AT', imageUrl: img('crv') },
      { id: 'c5', title: 'Skoda Octavia', price: 10500, currency: '$', year: 2016, mileageKm: 150000, city: 'Chișinău', fuel: 'Benzină', gearbox: 'MT', imageUrl: img('octavia') },
      { id: 'c6', title: 'Mercedes C-Class', price: 16900, currency: '$', year: 2012, mileageKm: 220000, city: 'Ungheni', fuel: 'Diesel', gearbox: 'AT', imageUrl: img('cclass') },
      { id: 'c7', title: 'Mazda 6', price: 12400, currency: '$', year: 2015, mileageKm: 160000, city: 'Soroca', fuel: 'Benzină', gearbox: 'AT', imageUrl: img('mazda6') },
      { id: 'c8', title: 'Nissan Qashqai', price: 13200, currency: '$', year: 2016, mileageKm: 170000, city: 'Chișinău', fuel: 'Diesel', gearbox: 'MT', imageUrl: img('qashqai') }
    ],
    reels: [
      { id: 'r1', title: 'Corolla: плюсы/минусы', author: 'AICar', videoUrl: vid('1'), posterUrl: img('reel1'), linkedCarId: 'c1' },
      { id: 'r2', title: 'Passat: что проверить', author: 'AICar', videoUrl: vid('2'), posterUrl: img('reel2'), linkedCarId: 'c3' },
      { id: 'r3', title: 'CR-V для семьи', author: 'AICar', videoUrl: vid('3'), posterUrl: img('reel3'), linkedCarId: 'c4' }
    ],
    news: [
      { id: 'n1', title: 'Как выбрать авто до $10k', excerpt: 'Короткий чек-лист для разумной покупки.', imageUrl: img('news1') },
      { id: 'n2', title: 'ТОП-5 ошибок при покупке', excerpt: 'На что люди чаще всего не обращают внимание.', imageUrl: img('news2') },
      { id: 'n3', title: 'Почему важна диагностика', excerpt: 'И как не попасть на ремонт.', imageUrl: img('news3') }
    ],
    faq: [
      { id: 'f1', q: 'Что такое AIChat?', a: 'Это AI-консультант, который помогает подобрать авто и объясняет нюансы.' },
      { id: 'f2', q: 'AIChat видит реальные объявления?', a: 'В демо — да, из мок-данных. В проде — будет брать из базы объявлений.' },
      { id: 'f3', q: 'Можно ли продавать авто?', a: 'Да, через раздел «Подать объявление».' },
      { id: 'f4', q: 'Что такое AIClips?', a: 'Короткие видео-обзоры по моделям, похожие на Reels.' },
      { id: 'f5', q: 'Будет ли модерация?', a: 'Да, контент и объявления будут проходить модерацию.' },
      { id: 'f6', q: 'Когда будет прод?', a: 'После демо — перенос на продовую инфраструктуру (БД, медиа, AI RAG).' }
    ]
  }
};
