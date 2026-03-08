import { BlockDefinition } from './blockTypes';

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: 'hero',
    label: 'Hero / Баннер',
    description: 'Варианты: default (заголовок+подзаголовок) или banner (как в прототипе).',
    defaultProps: {
      mode: 'banner',
      bannerHeight: 220,
      headline: 'Банер + Лого',
      subline: '',
      bgImage: ''
    },
    fields: [
      { key: 'mode', label: 'Режим (default|banner)', type: 'text', placeholder: 'banner' },
      { key: 'bannerHeight', label: 'Высота баннера (px)', type: 'number', min: 120, max: 520 },
      { key: 'headline', label: 'Заголовок', type: 'text' },
      { key: 'subline', label: 'Подзаголовок', type: 'textarea' },
      { key: 'bgImage', label: 'Фон (мок-загрузка)', type: 'image' }
    ]
  },
  {
    type: 'ai_prompt',
    label: 'AIChat (тизер)',
    description: 'Карточка AIChat как на лендинге (прототип).',
    defaultProps: {
      title: 'AIChat',
      subtitle: 'Введите ваши предпочтения и ИИ поможет подобрать для Вас идеальный вариант',
      placeholder: 'Семейный автомобиль, внедорожник. От 2020 года и выше. Полная комплектация…',
      showButton: false,
      cta: 'Спросить'
    },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'subtitle', label: 'Подзаголовок', type: 'textarea' },
      { key: 'placeholder', label: 'Placeholder', type: 'text' },
      { key: 'showButton', label: 'Показывать кнопку', type: 'boolean' },
      { key: 'cta', label: 'Текст кнопки', type: 'text' }
    ]
  },
  {
    type: 'search_widget',
    label: 'Расширенный поиск',
    description: 'Форма поиска (есть режим prototype как в макете).',
    defaultProps: {
      mode: 'prototype',
      title: 'Расширенный поиск',
      cta: 'Найти авто'
    },
    fields: [
      { key: 'mode', label: 'Режим (basic|prototype)', type: 'text', placeholder: 'prototype' },
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'cta', label: 'Текст кнопки', type: 'text' }
    ]
  },
  {
    type: 'section_title',
    label: 'Заголовок секции',
    defaultProps: { title: 'Секция', align: 'center' },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'align', label: 'Выравнивание (left|center)', type: 'text', placeholder: 'center' }
    ]
  },
  {
    type: 'car_detail',
    label: 'Карточка объявления (template)',
    defaultProps: { showAskAi: true, showLeadButton: true },
    fields: [
      { key: 'showLeadButton', label: 'Показывать кнопку заявки', type: 'boolean' },
      { key: 'showAskAi', label: 'Показывать «Спросить AI»', type: 'boolean' }
    ]
  },
  {
    type: 'car_grid',
    label: 'Сетка авто / предложения',
    description: 'Варианты: cards (обычно) или offers (как в прототипе).',
    defaultProps: { title: 'Специальные предложения', limit: 9, variant: 'offers', moreLabel: 'Больше', moreHref: '/search' },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'limit', label: 'Количество', type: 'number', min: 1, max: 24 },
      { key: 'variant', label: 'Вариант (cards|offers)', type: 'text', placeholder: 'offers' },
      { key: 'moreLabel', label: 'Текст ссылки «Больше»', type: 'text' },
      { key: 'moreHref', label: 'Ссылка «Больше»', type: 'url' }
    ]
  },
  {
    type: 'car_list',
    label: 'Список авто',
    defaultProps: { title: 'Результаты', limit: 10 },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'limit', label: 'Количество', type: 'number', min: 1, max: 50 }
    ]
  },
  {
    type: 'reels_strip',
    label: 'Лучшие AIClips (лента)',
    description: 'Как на главной: заголовок + «Больше» + стрелки.',
    defaultProps: { title: 'Лучшие AIClips', moreLabel: 'Больше', moreHref: '/aiclips', showArrows: true },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'moreLabel', label: 'Текст ссылки «Больше»', type: 'text' },
      { key: 'moreHref', label: 'Ссылка «Больше»', type: 'url' },
      { key: 'showArrows', label: 'Показывать стрелки', type: 'boolean' }
    ]
  },
  {
    type: 'reels_viewer',
    label: 'AIClips Viewer',
    defaultProps: { title: 'AIClips' },
    fields: [{ key: 'title', label: 'Заголовок', type: 'text' }]
  },
  {
    type: 'faq',
    label: 'FAQ',
    defaultProps: { title: 'FAQ', limit: 6 },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'limit', label: 'Количество', type: 'number', min: 1, max: 30 }
    ]
  },
  {
    type: 'cta_sell',
    label: 'CTA / Подать объявление',
    description: 'Вариант plus_tile — как в прототипе (квадрат с плюсом).',
    defaultProps: { title: 'Подай объявление', text: '', cta: 'Подать объявление', href: '/sell', variant: 'plus_tile' },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'text', label: 'Текст', type: 'textarea' },
      { key: 'cta', label: 'Текст кнопки/плитки', type: 'text' },
      { key: 'href', label: 'Ссылка', type: 'url' },
      { key: 'variant', label: 'Вариант (button|plus_tile)', type: 'text', placeholder: 'plus_tile' }
    ]
  },
  {
    type: 'news_cards',
    label: 'Новости',
    description: 'Вариант feature — как в прототипе (одна большая карточка + кнопка).',
    defaultProps: { title: 'Новости AICar', limit: 1, variant: 'feature', moreLabel: 'Больше новостей', moreHref: '/news' },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'limit', label: 'Количество', type: 'number', min: 1, max: 12 },
      { key: 'variant', label: 'Вариант (cards|feature)', type: 'text', placeholder: 'feature' },
      { key: 'moreLabel', label: 'Текст кнопки', type: 'text' },
      { key: 'moreHref', label: 'Ссылка кнопки', type: 'url' }
    ]
  },
  {
    type: 'spacer',
    label: 'Отступ',
    defaultProps: { h: 24 },
    fields: [{ key: 'h', label: 'Высота (px)', type: 'number', min: 0, max: 200 }]
  }
];
