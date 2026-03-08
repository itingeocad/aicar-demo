import Link from 'next/link';
import { Bike, Bus, Car, ChevronLeft, ChevronRight, Search, Truck, Plus } from 'lucide-react';
import { SiteConfig, BlockInstance } from '@/lib/site/types';

function Section({
  title,
  align = 'left',
  right,
  children
}: {
  title?: string;
  align?: 'left' | 'center';
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10">
      <div className="aicar-container">
        {title ? (
          <div className="mb-5 flex items-center">
            <h2 className={align === 'center' ? 'flex-1 text-center text-xl font-semibold' : 'text-xl font-semibold'}>
              {title}
            </h2>
            {right ? <div className={align === 'center' ? 'w-28 flex justify-end' : 'ml-auto'}>{right}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

function Hero({
  headline,
  subline,
  bgImage,
  mode,
  bannerHeight
}: {
  headline: string;
  subline: string;
  bgImage?: string;
  mode?: string;
  bannerHeight?: number;
}) {
  const isBanner = (mode ?? '').toLowerCase() === 'banner';
  if (isBanner) {
    return (
      <div
        className="border-b bg-slate-100"
        style={
          bgImage
            ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      >
        <div className={bgImage ? 'bg-slate-100/70' : ''}>
          <div className="aicar-container">
            <div className="flex items-center justify-center" style={{ height: bannerHeight ?? 220 }}>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-medium">{headline}</div>
                {subline ? <div className="mt-2 text-sm text-slate-600">{subline}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="border-b"
      style={
        bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined
      }
    >
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

function AIPrompt({
  title,
  subtitle,
  placeholder,
  showButton,
  cta
}: {
  title: string;
  subtitle: string;
  placeholder: string;
  showButton: boolean;
  cta: string;
}) {
  return (
    <section className="py-8">
      <div className="aicar-container">
        <div className="mx-auto max-w-3xl rounded-2xl bg-slate-300/60 p-6 shadow-sm">
          <div className="text-center text-3xl font-bold tracking-tight">{title}</div>
          <div className="mt-2 text-center text-sm text-slate-700">{subtitle}</div>

          <div className="mt-4 rounded-xl bg-white px-3 py-3">
            <Link href="/aichat" className="flex items-center gap-2">
              <Search className="h-5 w-5 text-slate-500" />
              <div className="text-sm text-slate-600 truncate">{placeholder}</div>
            </Link>
          </div>

          {showButton ? (
            <div className="mt-4 flex justify-center">
              <Link href="/aichat" className="rounded-xl bg-slate-900 text-white px-6 py-3 hover:bg-slate-800">
                {cta}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function LabeledInput({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-slate-600">{label}</div>
      <input className="w-full rounded-lg border bg-white px-3 py-2 text-sm" placeholder={placeholder ?? ''} />
    </label>
  );
}

function VehicleTypeRail({ orientation }: { orientation: 'vertical' | 'horizontal' }) {
  const Item = ({
    icon,
    active
  }: {
    icon: React.ReactNode;
    active?: boolean;
  }) => (
    <div
      className={
        (orientation === 'vertical' ? 'h-12' : 'w-16') +
        ' flex items-center justify-center ' +
        (active ? 'bg-white' : 'bg-slate-400/70')
      }
    >
      {icon}
    </div>
  );

  const base = orientation === 'vertical'
    ? 'w-16 overflow-hidden rounded-l-2xl'
    : 'w-full overflow-hidden rounded-t-2xl flex';

  return (
    <div className={base}>
      {orientation === 'vertical' ? (
        <div className="flex flex-col">
          <Item icon={<Car className="h-6 w-6 text-slate-700" />} active />
          <Item icon={<Truck className="h-6 w-6 text-slate-700" />} />
          <Item icon={<Bus className="h-6 w-6 text-slate-700" />} />
          <Item icon={<Bike className="h-6 w-6 text-slate-700" />} />
        </div>
      ) : (
        <>
          <Item icon={<Car className="h-6 w-6 text-slate-700" />} active />
          <Item icon={<Truck className="h-6 w-6 text-slate-700" />} />
          <Item icon={<Bus className="h-6 w-6 text-slate-700" />} />
          <Item icon={<Bike className="h-6 w-6 text-slate-700" />} />
        </>
      )}
    </div>
  );
}

function SearchWidget({ title, cta, mode }: { title: string; cta: string; mode?: string }) {
  const isPrototype = (mode ?? '').toLowerCase() === 'prototype';

  if (!isPrototype) {
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
        </div>
      </Section>
    );
  }

  return (
    <Section title={title} align="center">
      {/* Desktop layout */}
      <div className="hidden md:block">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="flex">
            <VehicleTypeRail orientation="vertical" />
            <div className="flex-1 p-5">
              <div className="grid grid-cols-4 gap-4">
                <LabeledInput label="Марка" />
                <LabeledInput label="Модель" />
                <LabeledInput label="Год выпуска" />
                <LabeledInput label="Километраж" />
                <LabeledInput label="Тип топлива" />
                <LabeledInput label="Город" />
                <LabeledInput label="Цена от" />
                <LabeledInput label="Цена до" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <Link href="/search" className="rounded-xl bg-slate-500 text-white px-10 py-3 shadow-sm hover:bg-slate-600">
            {cta}
          </Link>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden">
        <div className="mx-auto max-w-md rounded-2xl bg-white shadow-sm overflow-hidden">
          <VehicleTypeRail orientation="horizontal" />
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <LabeledInput label="Марка" />
              </div>
              <div className="col-span-1">
                <LabeledInput label="Модель" />
              </div>
              <div className="col-span-1">
                <LabeledInput label="Год" />
              </div>
              <div className="col-span-1">
                <LabeledInput label="Километраж" />
              </div>
              <div className="col-span-1">
                <LabeledInput label="Тип топлива" />
              </div>
              <div className="col-span-1">
                <LabeledInput label="Город" />
              </div>
              <div className="col-span-3 flex gap-3">
                <div className="flex-1">
                  <LabeledInput label="Цена от" />
                </div>
                <div className="flex-1">
                  <LabeledInput label="Цена до" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <Link href="/search" className="rounded-xl bg-slate-500 text-white px-10 py-3 shadow-sm hover:bg-slate-600">
            {cta}
          </Link>
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

function OfferCard({ car }: { car: SiteConfig['demoData']['cars'][number] }) {
  return (
    <Link href={`/cars/${car.id}`} className="block rounded-2xl bg-white shadow-sm border overflow-hidden">
      <div className="aspect-[4/3] bg-white flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
      </div>
      <div className="bg-slate-400/80 p-4 text-center text-sm text-white">Описание</div>
    </Link>
  );
}

function OfferRow({ car }: { car: SiteConfig['demoData']['cars'][number] }) {
  return (
    <Link href={`/cars/${car.id}`} className="block rounded-2xl bg-slate-400/80 border overflow-hidden">
      <div className="flex">
        <div className="w-28 bg-white p-2">
          <div className="aspect-square bg-white border rounded-xl overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
          </div>
          <div className="mt-2 text-[10px] text-center text-slate-600">Фото объявления</div>
        </div>
        <div className="flex-1 p-4 text-white font-medium">Описание</div>
      </div>
    </Link>
  );
}

function MoreLink({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
      {label} <ChevronRight className="h-4 w-4" />
    </Link>
  );
}

function CarGrid({
  title,
  limit,
  config,
  variant,
  moreLabel,
  moreHref
}: {
  title: string;
  limit: number;
  config: SiteConfig;
  variant?: string;
  moreLabel?: string;
  moreHref?: string;
}) {
  const cars = config.demoData.cars.slice(0, limit);

  if ((variant ?? '').toLowerCase() === 'offers') {
    return (
      <Section
        title={title}
        align="center"
        right={moreLabel && moreHref ? <MoreLink label={moreLabel} href={moreHref} /> : null}
      >
        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-3 gap-6 rounded-2xl bg-white p-6 shadow-sm">
          {cars.map((c) => (
            <OfferCard key={c.id} car={c} />
          ))}
        </div>

        {/* Mobile list */}
        <div className="md:hidden space-y-4">
          {cars.slice(0, Math.min(cars.length, 5)).map((c) => (
            <OfferRow key={c.id} car={c} />
          ))}
        </div>
      </Section>
    );
  }

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

function ReelsStrip({
  title,
  config,
  moreLabel,
  moreHref,
  showArrows
}: {
  title: string;
  config: SiteConfig;
  moreLabel?: string;
  moreHref?: string;
  showArrows?: boolean;
}) {
  const reels = config.demoData.reels.slice(0, 4);
  const right = moreLabel && moreHref ? <MoreLink label={moreLabel} href={moreHref} /> : null;

  return (
    <Section title={title} align="center" right={right}>
      {/* Desktop */}
      <div className="hidden md:block relative">
        {showArrows ? (
          <>
            <button
              aria-label="prev"
              className="absolute -left-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              type="button"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
            <button
              aria-label="next"
              className="absolute -right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              type="button"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          </>
        ) : null}

        <div className="grid grid-cols-4 gap-8 justify-items-center">
          {reels.map((r) => (
            <Link key={r.id} href="/aiclips" className="w-full max-w-[210px]">
              <div className="aspect-[9/16] rounded-2xl bg-slate-200 shadow-sm" />
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden relative">
        {showArrows ? (
          <>
            <button aria-label="prev" className="absolute -left-6 top-1/2 -translate-y-1/2 text-slate-400" type="button">
              <ChevronLeft className="h-10 w-10" />
            </button>
            <button aria-label="next" className="absolute -right-6 top-1/2 -translate-y-1/2 text-slate-400" type="button">
              <ChevronRight className="h-10 w-10" />
            </button>
          </>
        ) : null}
        <div className="mx-auto max-w-xs">
          <div className="aspect-[9/16] rounded-2xl bg-slate-200 shadow-sm" />
        </div>
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

function CTA({
  title,
  text,
  cta,
  href,
  variant
}: {
  title: string;
  text: string;
  cta: string;
  href: string;
  variant?: string;
}) {
  const isPlus = (variant ?? '').toLowerCase() === 'plus_tile';

  if (isPlus) {
    return (
      <section className="py-12">
        <div className="aicar-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-2xl font-semibold">{title}</div>

            <div className="hidden md:block">
              <svg width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 40 C 70 5, 140 5, 205 35" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
                <path d="M197 20 L210 35 L195 45" stroke="#111827" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <Link
              href={href}
              className="h-28 w-28 md:h-40 md:w-40 rounded-2xl bg-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-300"
              aria-label={cta}
            >
              <Plus className="h-10 w-10 text-slate-900" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

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

function NewsCards({
  title,
  limit,
  config,
  variant,
  moreLabel,
  moreHref
}: {
  title: string;
  limit: number;
  config: SiteConfig;
  variant?: string;
  moreLabel?: string;
  moreHref?: string;
}) {
  const items = config.demoData.news.slice(0, limit);
  const first = items[0];

  if ((variant ?? '').toLowerCase() === 'feature') {
    return (
      <Section title={title} align="center">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-sm border overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-72 bg-slate-200 flex items-center justify-center">
              <div className="h-44 w-full md:h-full md:w-full flex items-center justify-center text-slate-600">Фото</div>
            </div>
            <div className="flex-1 p-6">
              <div className="text-sm text-slate-600">Описание новости</div>
              <div className="mt-3 text-sm text-slate-600">{first?.excerpt ?? ''}</div>
              <div className="mt-4">
                {moreLabel && moreHref ? (
                  <Link href={moreHref} className="inline-flex rounded-xl bg-slate-500 px-6 py-3 text-white hover:bg-slate-600">
                    {moreLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Section>
    );
  }

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
      return (
        <Hero
          headline={String(p.headline ?? '')}
          subline={String(p.subline ?? '')}
          bgImage={String(p.bgImage ?? '') || undefined}
          mode={String(p.mode ?? '')}
          bannerHeight={p.bannerHeight ? Number(p.bannerHeight) : undefined}
        />
      );
    case 'ai_prompt':
      return (
        <AIPrompt
          title={String(p.title ?? 'AIChat')}
          subtitle={String(p.subtitle ?? '')}
          placeholder={String(p.placeholder ?? '')}
          showButton={Boolean(p.showButton ?? false)}
          cta={String(p.cta ?? 'Спросить')}
        />
      );
    case 'search_widget':
      return <SearchWidget title={String(p.title ?? '')} cta={String(p.cta ?? '')} mode={String(p.mode ?? '')} />;
    case 'section_title': {
      const align = (String(p.align ?? 'left') as 'left' | 'center') || 'left';
      return (
        <div className="aicar-container py-6">
          <h1 className={align === 'center' ? 'text-2xl font-bold text-center' : 'text-2xl font-bold'}>
            {String(p.title ?? '')}
          </h1>
        </div>
      );
    }
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
      return (
        <CarGrid
          title={String(p.title ?? '')}
          limit={Number(p.limit ?? 6)}
          variant={String(p.variant ?? '')}
          moreLabel={String(p.moreLabel ?? '')}
          moreHref={String(p.moreHref ?? '')}
          config={config}
        />
      );
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
      return (
        <ReelsStrip
          title={String(p.title ?? '')}
          moreLabel={String(p.moreLabel ?? '')}
          moreHref={String(p.moreHref ?? '')}
          showArrows={Boolean(p.showArrows ?? true)}
          config={config}
        />
      );
    case 'reels_viewer':
      return <ReelsViewer title={String(p.title ?? 'AIClips')} config={config} />;
    case 'faq':
      return <FAQ title={String(p.title ?? 'FAQ')} limit={Number(p.limit ?? 6)} config={config} />;
    case 'cta_sell':
      return (
        <CTA
          title={String(p.title ?? '')}
          text={String(p.text ?? '')}
          cta={String(p.cta ?? '')}
          href={String(p.href ?? '/')}
          variant={String(p.variant ?? '')}
        />
      );
    case 'news_cards':
      return (
        <NewsCards
          title={String(p.title ?? '')}
          limit={Number(p.limit ?? 3)}
          variant={String(p.variant ?? '')}
          moreLabel={String(p.moreLabel ?? '')}
          moreHref={String(p.moreHref ?? '')}
          config={config}
        />
      );
    case 'spacer':
      return <Spacer h={Number(p.h ?? 24)} />;
    default:
      return null;
  }
}
