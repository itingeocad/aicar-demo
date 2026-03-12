import Link from 'next/link';
import { DemoNews, SiteConfig } from '@/lib/site/types';

function getNewsItems(config: SiteConfig): DemoNews[] {
  const base =
    config.demoData.news && config.demoData.news.length > 0
      ? config.demoData.news
      : [
          {
            id: 'news-fallback-1',
            title: 'Описание новости',
            excerpt: '',
            imageUrl: ''
          }
        ];

  return Array.from({ length: 5 }, (_, i) => {
    const item = base[i % base.length];
    return {
      ...item,
      id: `${item.id}-${i + 1}`
    };
  });
}

function NewsImage({ item, mobile = false }: { item: DemoNews; mobile?: boolean }) {
  if (item.imageUrl) {
    return (
      <img
        src={item.imageUrl}
        alt={item.title}
        className={
          mobile
            ? 'h-[150px] w-[124px] rounded-[6px] object-cover'
            : 'h-[230px] w-[230px] rounded-[6px] object-cover'
        }
      />
    );
  }

  return (
    <div
      className={
        mobile
          ? 'flex h-[150px] w-[124px] items-center justify-center rounded-[6px] bg-[#d9d9d9] text-[16px] text-slate-900'
          : 'flex h-[230px] w-[230px] items-center justify-center rounded-[6px] bg-[#d9d9d9] text-[18px] text-slate-900'
      }
    >
      Фото
    </div>
  );
}

function NewsCard({ item, mobile = false }: { item: DemoNews; mobile?: boolean }) {
  if (mobile) {
    return (
      <article className="rounded-[24px] bg-[#f4f4f4] px-4 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <NewsImage item={item} mobile />
          </div>

          <div className="flex min-h-[150px] flex-1 flex-col">
            <div className="text-[17px] leading-[1.2] text-slate-900">
              {item.title || 'Описание новости'}
            </div>

            <div className="mt-auto pt-5">
              <Link
                href="/news"
                className="inline-flex min-h-[54px] min-w-[190px] items-center justify-center rounded-[18px] bg-[#a9a9a9] px-8 text-[18px] font-medium text-slate-900"
              >
                Подробнее
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[18px] bg-[#f4f4f4] px-8 py-8 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex gap-8">
        <div className="shrink-0">
          <NewsImage item={item} />
        </div>

        <div className="flex min-h-[230px] flex-1 flex-col">
          <div className="text-[18px] leading-none text-slate-900">
            {item.title || 'Описание новости'}
          </div>

          <div className="mt-auto pt-8">
            <Link
              href="/news"
              className="inline-flex min-h-[52px] min-w-[180px] items-center justify-center rounded-[10px] bg-[#a9a9a9] px-8 text-[18px] font-medium text-slate-900"
            >
              Подробнее
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function NewsPage({ config }: { config: SiteConfig }) {
  const items = getNewsItems(config);

  return (
    <>
      <div className="hidden md:block">
        <section>
          <div className="aicar-container pb-8 pt-12 text-center">
            <h1 className="text-center text-[64px] font-semibold tracking-[-0.04em] text-slate-900">
              Новости AICar
            </h1>

            <p className="mx-auto mt-8 max-w-[960px] text-[18px] leading-[1.35] text-slate-900">
              В разделе «Новости AiCar» публикуются актуальные материалы из мира автомобилей и технологий.
              Обзоры новых моделей, аналитика рынка, тренды электромобилей, полезные рекомендации по выбору и
              покупке авто, а также обновления платформы.
            </p>

            <p className="mx-auto mt-7 max-w-[960px] text-[18px] font-medium leading-[1.35] text-slate-900">
              AiCar — это не только поиск автомобиля, но и источник экспертной информации для взвешенного решения.
            </p>
          </div>
        </section>

        <section className="pb-[120px] pt-3">
          <div className="aicar-container">
            <h2 className="text-center text-[36px] font-medium tracking-[-0.03em] text-slate-900">
              Hot news
            </h2>

            <div className="mt-8 space-y-5">
              {items.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="md:hidden">
        <section>
          <div className="aicar-container pb-8 pt-10 text-center">
            <h1 className="text-center text-[44px] font-semibold tracking-[-0.04em] text-slate-900">
              Новости AICar
            </h1>

            <p className="mx-auto mt-7 max-w-[960px] text-[18px] leading-[1.25] text-slate-900">
              В разделе «Новости AiCar» публикуются актуальные материалы из мира автомобилей и технологий.
              Обзоры новых моделей, аналитика рынка, тренды электромобилей, полезные рекомендации по выбору и
              покупке авто, а также обновления платформы.
            </p>

            <p className="mx-auto mt-7 max-w-[960px] text-[18px] font-medium leading-[1.25] text-slate-900">
              AiCar — это не только поиск автомобиля, но и источник экспертной информации для взвешенного решения.
            </p>
          </div>
        </section>

        <section className="pb-[96px] pt-4">
          <div className="aicar-container">
            <h2 className="text-center text-[28px] font-medium tracking-[-0.03em] text-slate-900">
              Hot news
            </h2>

            <div className="mt-7 space-y-4">
              {items.map((item) => (
                <NewsCard key={item.id} item={item} mobile />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}