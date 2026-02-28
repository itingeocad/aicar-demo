import { BlockDefinition } from './blockTypes';

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: 'hero',
    label: 'Hero',
    defaultProps: { headline: 'Заголовок', subline: 'Подзаголовок', bgImage: '' },
    fields: [
      { key: 'headline', label: 'Заголовок', type: 'text' },
      { key: 'subline', label: 'Подзаголовок', type: 'textarea' },
      { key: 'bgImage', label: 'Фон (мок-загрузка)', type: 'image' }
    ]
  },
  {
    type: 'ai_prompt',
    label: 'AI Prompt',
    defaultProps: { placeholder: 'Спроси AI…', cta: 'Спросить' },
    fields: [
      { key: 'placeholder', label: 'Placeholder', type: 'text' },
      { key: 'cta', label: 'Текст кнопки', type: 'text' }
    ]
  },
  {
    type: 'search_widget',
    label: 'Поиск (виджет)',
    defaultProps: { title: 'Расширенный поиск', cta: 'Найти' },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'cta', label: 'Текст кнопки', type: 'text' }
    ]
  },
  {
    type: 'section_title',
    label: 'Заголовок секции',
    defaultProps: { title: 'Секция' },
    fields: [{ key: 'title', label: 'Заголовок', type: 'text' }]
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
    label: 'Сетка авто',
    defaultProps: { title: 'Авто', limit: 6 },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'limit', label: 'Количество', type: 'number', min: 1, max: 24 }
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
    label: 'AIClips (полоса)',
    defaultProps: { title: 'Лучшие AIClips' },
    fields: [{ key: 'title', label: 'Заголовок', type: 'text' }]
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
    defaultProps: { title: 'Подать объявление', text: 'Описание', cta: 'Перейти', href: '/sell' },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'text', label: 'Текст', type: 'textarea' },
      { key: 'cta', label: 'Текст кнопки', type: 'text' },
      { key: 'href', label: 'Ссылка', type: 'url' }
    ]
  },
  {
    type: 'news_cards',
    label: 'Новости (карточки)',
    defaultProps: { title: 'Новости', limit: 3 },
    fields: [
      { key: 'title', label: 'Заголовок', type: 'text' },
      { key: 'limit', label: 'Количество', type: 'number', min: 1, max: 12 }
    ]
  },
  {
    type: 'spacer',
    label: 'Отступ',
    defaultProps: { h: 24 },
    fields: [{ key: 'h', label: 'Высота (px)', type: 'number', min: 0, max: 200 }]
  }
];
