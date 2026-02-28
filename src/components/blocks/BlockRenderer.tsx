import Link from 'next/link';
import { SiteConfig, BlockInstance } from '@/lib/site/types';

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="py-6">
      <div className="aicar-container">
        {title ? <h2 className="mb-4 text-lg font-semibold">{title}</h2> : null}
        {children}
      </div>
    </section>
  );
}

function Hero({ headline, subline, bgImage }: { headline: string; subline: string; bgImage?: string }) {
  return (
    <div className="border-b" style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
      <div className={bgImage ? 'bg-white/75' : 'bg-slate-50'}>
        <div className="aicar-container py-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{headline}</h1>
          <p className="mt-3 text-slate-600">{subline}</p>
        </div>
      </div>
      </div>
    </div>
  );
}

function AIPrompt({ placeholder, cta }: { placeholder: string; cta: string }) {
  return (
    <Section>
      <div className="rounded-2xl border bg-white p-4 md:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200"
            placeholder={placeholder}
          />
          <Link
            href="/aichat"
            className="rounded-xl bg-slate-900 text-white px-5 py-3 text-center hover:bg-slate-800"
          >
            {cta}
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-500">В демо это ведёт на AIChat-страницу.</p>
      </div>
    </Section>
  );
}

function SearchWidget({ title, cta }: { title: string; cta: string }) {
  return (
    <Section title={title}>
      <div className="rounded-2xl border bg-white p-4 md:p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <select className="rounded-xl border px-3 py-3 md:col-span-1">
            <option>Авто</option>
            <option>Мото</option>
            <option>Коммерч.</option>
          </select>
          <input className="rounded-xl border px-3 py-3 md:col-span-2" placeholder="Марка / модель" />
          <input className="rounded-xl border px-3 py-3 md:col-span-1" placeholder="Цена от" />
          <input className="rounded-xl border px-3 py-3 md:col-span-1" placeholder="Цена до" />
          <Link href="/search" className="rounded-xl bg-slate-900 text-white px-4 py-3 text-center hover:bg-slate-800">
            {cta}
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Год</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Пробег</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">КПП</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Город</span>
        </div>
      </div>
    </Section>
  );
}

function CarCard({ car }: { car: SiteConfig['demoData']['cars'][number] }) {
  return (
    <Link href={`/cars/${car.id}`} className="group block overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow">
      <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover group-hover:scale-[1.02] transition" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">{car.title}</div>
            <div className="text-xs text-slate-500">{car.city} • {car.year} • {car.mileageKm.toLocaleString()} km</div>
          </div>
          <div className="font-bold whitespace-nowrap">{car.price.toLocaleString()} {car.currency}</div>
        </div>
      </div>
    </Link>
  );
}

function CarGrid({ title, limit, config }: { title: string; limit: number; config: SiteConfig }) {
  const cars = config.demoData.cars.slice(0, limit);
  return (
    <Section title={title}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((c) => (
          <CarCard key={c.id} car={c} />
        ))}
      </div>
    </Section>
  );
}

function CarList({ title, limit, config, withSidebarHint }: { title: string; limit: number; config: SiteConfig; withSidebarHint?: boolean }) {
  const cars = config.demoData.cars.slice(0, limit);
  return (
    <Section title={title}>
      {withSidebarHint ? (
        <div className="mb-3 rounded-xl border bg-slate-50 p-3 text-sm text-slate-600">
          Вариант 2 поиска (как на wireframe): слева будет сайдбар фильтров. В демо — подсказка.
        </div>
      ) : null}
      <div className="space-y-3">
        {cars.map((car) => (
          <Link key={car.id} href={`/cars/${car.id}`} className="flex gap-3 rounded-2xl border bg-white p-3 shadow-sm hover:shadow">
            <div className="h-24 w-36 flex-none overflow-hidden rounded-xl bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{car.title}</div>
                  <div className="text-xs text-slate-500">{car.city} • {car.year} • {car.mileageKm.toLocaleString()} km</div>
                </div>
                <div className="font-bold whitespace-nowrap">{car.price.toLocaleString()} {car.currency}</div>
              </div>
              <div className="mt-2 text-xs text-slate-600">Топливо: {car.fuel ?? '—'} • КПП: {car.gearbox ?? '—'}</div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function ReelsStrip({ title, config }: { title: string; config: SiteConfig }) {
  const reels = config.demoData.reels;
  return (
    <Section title={title}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {reels.map((r) => (
          <Link key={r.id} href="/aiclips" className="w-56 flex-none rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow">
            <div className="aspect-[9/16] bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.posterUrl} alt={r.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold">{r.title}</div>
              <div className="text-xs text-slate-500">@{r.author}</div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function ReelsViewer({ title, config }: { title: string; config: SiteConfig }) {
  const reels = config.demoData.reels;
  const first = reels[0];
  return (
    <div className="aicar-container py-8">
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <div className="mx-auto max-w-sm">
        <div className="overflow-hidden rounded-2xl border bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={first.videoUrl} poster={first.posterUrl} controls className="h-[520px] w-full object-cover" />
        </div>
        <div className="mt-3 text-sm font-semibold">{first.title}</div>
        <div className="text-xs text-slate-500">@{first.author}</div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {reels.slice(0, 3).map((r) => (
            <Link key={r.id} href="/aiclips" className="aspect-[9/16] overflow-hidden rounded-xl border bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.posterUrl} alt={r.title} className="h-full w-full object-cover" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function FAQ({ title, limit, config }: { title: string; limit: number; config: SiteConfig }) {
  const items = config.demoData.faq.slice(0, limit);
  return (
    <Section title={title}>
      <div className="space-y-2">
        {items.map((it) => (
          <details key={it.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <summary className="cursor-pointer font-semibold">{it.q}</summary>
            <p className="mt-2 text-sm text-slate-600">{it.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function CTA({ title, text, cta, href }: { title: string; text: string; cta: string; href: string }) {
  return (
    <Section>
      <div className="rounded-2xl border bg-slate-50 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-slate-600">{text}</div>
        </div>
        <Link href={href} className="rounded-xl bg-slate-900 text-white px-5 py-3 hover:bg-slate-800">
          {cta}
        </Link>
      </div>
    </Section>
  );
}

function NewsCards({ title, limit, config }: { title: string; limit: number; config: SiteConfig }) {
  const items = config.demoData.news.slice(0, limit);
  return (
    <Section title={title}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((n) => (
          <div key={n.id} className="rounded-2xl border bg-white overflow-hidden shadow-sm">
            <div className="aspect-[16/10] bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={n.imageUrl} alt={n.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <div className="font-semibold">{n.title}</div>
              <div className="mt-1 text-sm text-slate-600">{n.excerpt}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Spacer({ h }: { h: number }) {
  return <div style={{ height: h }} />;
}

export function BlockRenderer({
  block,
  config,
  ctx
}: {
  block: BlockInstance;
  config: SiteConfig;
  ctx?: { carId?: string };
}) {
  if (block.isEnabled === false) return null;

  const t = block.type;
  const p = block.props as any;

  switch (t) {
    case 'hero':
      return <Hero headline={String(p.headline ?? '')} subline={String(p.subline ?? '')} bgImage={String(p.bgImage ?? '') || undefined} />;
    case 'ai_prompt':
      return <AIPrompt placeholder={String(p.placeholder ?? '')} cta={String(p.cta ?? '')} />;
    case 'search_widget':
      return <SearchWidget title={String(p.title ?? '')} cta={String(p.cta ?? '')} />;
    case 'section_title':
      return (
        <div className="aicar-container py-6">
          <h1 className="text-2xl font-bold">{String(p.title ?? '')}</h1>
        </div>
      );
    case 'car_detail': {
      const carId = ctx?.carId;
      const car = carId ? config.demoData.cars.find((c) => c.id === carId) : null;
      if (!car) {
        return (
          <div className="aicar-container py-10">
            <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">Нет данных объявления.</div>
          </div>
        );
      }

      const thumbs = [car.imageUrl, ...config.demoData.cars.slice(0, 6).map((c) => c.imageUrl)].slice(0, 5);
      const showLeadButton = Boolean(p.showLeadButton ?? true);
      const showAskAi = Boolean(p.showAskAi ?? true);

      return (
        <div className="aicar-container py-6">
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-2 hidden md:block space-y-2">
                  {thumbs.map((t, idx) => (
                    <div key={idx} className="aspect-square overflow-hidden rounded-xl border bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t} alt="thumb" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="col-span-12 md:col-span-10 overflow-hidden rounded-2xl border bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold">{car.title}</h1>
                    <div className="mt-1 text-sm text-slate-600">
                      {car.city} • {car.year} • {car.mileageKm.toLocaleString()} km
                    </div>
                  </div>
                  <div className="text-2xl font-bold whitespace-nowrap">
                    {car.price.toLocaleString()} {car.currency}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Топливо</div>
                    <div className="font-semibold">{car.fuel ?? '—'}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">КПП</div>
                    <div className="font-semibold">{car.gearbox ?? '—'}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Год</div>
                    <div className="font-semibold">{car.year}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Пробег</div>
                    <div className="font-semibold">{car.mileageKm.toLocaleString()} km</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-slate-500">Описание</div>
                  <p className="mt-1 text-sm text-slate-700">
                    Демо-описание объявления. В проде сюда пойдут реальные поля из базы и характеристики.
                  </p>
                </div>

                <div className="mt-5 flex gap-3">
                  {showLeadButton ? (
                    <button className="flex-1 rounded-xl bg-slate-900 text-white px-4 py-3 hover:bg-slate-800">
                      Оставить заявку
                    </button>
                  ) : null}
                  {showAskAi ? (
                    <a href="/aichat" className="rounded-xl border px-4 py-3 hover:bg-slate-50">
                      Спросить AI
                    </a>
                  ) : null}
                </div>

                <div className="mt-3 text-xs text-slate-500">Загрузка медиа и лиды — мок в демо.</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    case 'car_grid':
      return <CarGrid title={String(p.title ?? '')} limit={Number(p.limit ?? 6)} config={config} />;
    case 'car_list':
      return (
        <CarList
          title={String(p.title ?? '')}
          limit={Number(p.limit ?? 10)}
          withSidebarHint={Boolean(p.withSidebarHint ?? false)}
          config={config}
        />
      );
    case 'reels_strip':
      return <ReelsStrip title={String(p.title ?? '')} config={config} />;
    case 'reels_viewer':
      return <ReelsViewer title={String(p.title ?? 'AIClips')} config={config} />;
    case 'faq':
      return <FAQ title={String(p.title ?? 'FAQ')} limit={Number(p.limit ?? 6)} config={config} />;
    case 'cta_sell':
      return <CTA title={String(p.title ?? '')} text={String(p.text ?? '')} cta={String(p.cta ?? '')} href={String(p.href ?? '/')} />;
    case 'news_cards':
      return <NewsCards title={String(p.title ?? '')} limit={Number(p.limit ?? 3)} config={config} />;
    case 'spacer':
      return <Spacer h={Number(p.h ?? 24)} />;
    default:
      return null;
  }
}
