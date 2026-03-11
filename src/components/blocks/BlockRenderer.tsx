import Link from 'next/link';
import { Bike, Bus, Car, Search, Truck, Plus, ChevronRight } from 'lucide-react';
import { SiteConfig, BlockInstance } from '@/lib/site/types';
import { ReelsStripClient } from '@/components/blocks/ReelsStripClient';
import { SearchPrototypeForm } from '@/components/blocks/SearchPrototypeForm';

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
  const centered = align === 'center';

  return (
    <section className="py-8 md:py-10">
      <div className="aicar-container">
        <div className={centered ? 'mx-auto max-w-[960px]' : ''}>
          {title ? (
            centered ? (
              <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center">
                <div />
                <h2 className="text-center text-[18px] font-semibold tracking-[-0.02em] md:text-[32px]">{title}</h2>
                <div className="justify-self-end">{right ?? <span />}</div>
              </div>
            ) : (
              <div className="mb-5 flex items-center">
                <h2 className="text-xl font-semibold">{title}</h2>
                {right ? <div className="ml-auto">{right}</div> : null}
              </div>
            )
          ) : null}
          {children}
        </div>
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
  const height = bannerHeight ?? 280;

  if (isBanner) {
    return (
      <section className="border-b border-black/5 bg-[#e8e8e8]">
        <div className="aicar-container">
          <div className="flex items-center justify-center text-center" style={{ height }}>
            {bgImage ? (
              <img src={bgImage} alt={headline || 'Баннер'} className="h-full w-full object-contain" />
            ) : (
              <div className="space-y-2">
                <div className="text-[18px] font-medium tracking-[-0.02em] md:text-[32px]">{headline}</div>
                {subline ? <div className="text-sm text-slate-600">{subline}</div> : null}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      className="border-b border-black/5"
      style={
        bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined
      }
    >
      <div className={bgImage ? 'bg-white/75' : 'bg-slate-50'}>
        <div className="aicar-container py-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{headline}</h1>
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
    <section className="relative z-10 -mt-10 pb-8 md:-mt-[86px] md:pb-10">
      <div className="aicar-container">
        <div className="mx-auto max-w-[960px] rounded-[12px] bg-[#d5d5d5] px-4 py-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] md:px-8 md:py-8">
          <div className="text-center text-[28px] font-semibold tracking-[-0.02em] md:text-[52px]">{title}</div>
          <div className="mx-auto mt-2 max-w-[760px] text-center text-[12px] leading-5 text-slate-700 md:text-[15px]">
            {subtitle}
          </div>

          <div className="mt-5 rounded-[8px] bg-white px-3 py-3 ring-1 ring-black/5 md:px-4 md:py-4">
            <Link href="/aichat" className="flex items-center gap-3">
              <Search className="h-5 w-5 flex-none text-slate-500" />
              <div className="truncate text-[13px] text-slate-600 md:text-sm">{placeholder}</div>
            </Link>
          </div>

          {showButton ? (
            <div className="mt-5 flex justify-center">
              <Link href="/aichat" className="rounded-[8px] bg-slate-900 px-6 py-3 text-white hover:bg-slate-800">
                {cta}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function LabeledInput({
  label,
  name,
  placeholder,
  defaultValue
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] leading-4 text-slate-600 md:text-[12px]">{label}</div>
      <input
        name={name}
        defaultValue={defaultValue}
        className="h-9 w-full rounded-[8px] border border-black/10 bg-white px-3 text-[13px] outline-none transition focus:border-slate-400 md:h-10"
        placeholder={placeholder ?? ''}
      />
    </label>
  );
}

type VehicleTypeKey = 'car' | 'truck' | 'bus' | 'bike';

function VehicleTypeRail({
  orientation,
  name,
  value
}: {
  orientation: 'vertical' | 'horizontal';
  name: string;
  value: VehicleTypeKey;
}) {
  const items: { key: VehicleTypeKey; icon: React.ReactNode; label: string }[] = [
    { key: 'car', icon: <Car className="h-6 w-6 text-slate-700" />, label: 'Авто' },
    { key: 'truck', icon: <Truck className="h-6 w-6 text-slate-700" />, label: 'Груз.' },
    { key: 'bus', icon: <Bus className="h-6 w-6 text-slate-700" />, label: 'Вэн' },
    { key: 'bike', icon: <Bike className="h-6 w-6 text-slate-700" />, label: 'Мото' }
  ];

  const Item = ({ k, icon }: { k: VehicleTypeKey; icon: React.ReactNode }) => {
    const active = value === k;
    return (
      <label
        className={
          (orientation === 'vertical' ? 'h-[54px] w-[74px]' : 'h-[54px] flex-1') +
          ' flex cursor-pointer select-none items-center justify-center border-black/5 transition ' +
          (orientation === 'vertical' ? ' border-b last:border-b-0 ' : ' border-r last:border-r-0 ') +
          (active ? 'bg-[#b7c0cf]' : 'bg-[#cfd5df] hover:bg-[#c3cad6]')
        }
        title={items.find((i) => i.key === k)?.label}
      >
        <input type="radio" className="sr-only" name={name} value={k} defaultChecked={active} />
        {icon}
      </label>
    );
  };

  if (orientation === 'vertical') {
    return (
      <div className="w-[74px] overflow-hidden rounded-l-[12px] bg-[#cfd5df]">
        <div className="flex flex-col">
          {items.map((it) => (
            <Item key={it.key} k={it.key} icon={it.icon} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full overflow-hidden rounded-t-[12px] bg-[#cfd5df]">
      {items.map((it) => (
        <Item key={it.key} k={it.key} icon={it.icon} />
      ))}
    </div>
  );
}

function pick1(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

function SearchWidget({
  title,
  cta,
  mode,
  initial
}: {
  title: string;
  cta: string;
  mode?: string;
  initial?: Record<string, string | string[] | undefined>;
}) {
  const isPrototype = (mode ?? '').toLowerCase() === 'prototype';
  const initType = (pick1(initial?.type) as VehicleTypeKey) || 'car';

  if (!isPrototype) {
    return (
      <Section title={title}>
        <form action="/search" method="GET" className="rounded-2xl border bg-white p-4 shadow-sm md:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <select name="type" defaultValue={initType} className="rounded-xl border px-3 py-3 md:col-span-1">
              <option value="car">Авто</option>
              <option value="bike">Мото</option>
              <option value="truck">Груз.</option>
              <option value="bus">Вэн</option>
            </select>
            <input
              name="q"
              defaultValue={pick1(initial?.q)}
              className="rounded-xl border px-3 py-3 md:col-span-2"
              placeholder="Марка / модель"
            />
            <input
              name="priceFrom"
              defaultValue={pick1(initial?.priceFrom)}
              className="rounded-xl border px-3 py-3 md:col-span-1"
              placeholder="Цена от"
            />
            <input
              name="priceTo"
              defaultValue={pick1(initial?.priceTo)}
              className="rounded-xl border px-3 py-3 md:col-span-1"
              placeholder="Цена до"
            />
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-3 text-center text-white hover:bg-slate-800">
              {cta}
            </button>
          </div>
        </form>
      </Section>
    );
  }

  return (
    <Section title={title} align="center">
      <SearchPrototypeForm cta={cta} initial={initial} />
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
    <Link href={`/cars/${car.id}`} className="mx-auto block w-full max-w-[280px] overflow-hidden rounded-[10px] border border-black/10 bg-[#a6a6a6]">
      <div className="aspect-square bg-white flex items-center justify-center">
        <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
      </div>
      <div className="flex h-[78px] items-center justify-center px-3 text-center text-[12px] text-white">Описание</div>
    </Link>
  );
}

function OfferRow({ car }: { car: SiteConfig['demoData']['cars'][number] }) {
  return (
    <Link href={`/cars/${car.id}`} className="block overflow-hidden rounded-[10px] border border-black/10 bg-[#a6a6a6]">
      <div className="flex">
        <div className="w-[120px] bg-white p-3">
          <div className="aspect-square overflow-hidden rounded-[8px] border border-black/10 bg-white">
            <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 text-[13px] text-white">Описание</div>
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
  const allCars = config.demoData.cars;
  const cars = ((variant ?? '').toLowerCase() === 'offers'
    ? allCars.filter((c) => (c.vehicleType ?? 'car') === 'car')
    : allCars
  ).slice(0, limit);

  if ((variant ?? '').toLowerCase() === 'offers') {
    return (
      <Section
        title={title}
        align="center"
        right={moreLabel && moreHref ? <MoreLink label={moreLabel} href={moreHref} /> : null}
      >
        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
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

function getNum(v: string) {
  const n = Number(String(v).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

function CarList({
  title,
  limit,
  config,
  withSidebarHint,
  search
}: {
  title: string;
  limit: number;
  config: SiteConfig;
  withSidebarHint?: boolean;
  search?: Record<string, string | string[] | undefined>;
}) {
  const sp = search ?? {};

  const type = pick1(sp.type) as any;
  const brand = pick1(sp.brand).trim().toLowerCase();
  const model = pick1(sp.model).trim().toLowerCase();
  const city = pick1(sp.city).trim().toLowerCase();
  const fuel = pick1(sp.fuel).trim().toLowerCase();

  const year = getNum(pick1(sp.year));
  const mileage = getNum(pick1(sp.mileageKm));
  const priceFrom = getNum(pick1(sp.priceFrom));
  const priceTo = getNum(pick1(sp.priceTo));

  let cars = [...config.demoData.cars];

  if (type) {
    cars = cars.filter((c) => (c.vehicleType ?? 'car') === type);
  }
  if (brand) cars = cars.filter((c) => c.title.toLowerCase().includes(brand));
  if (model) cars = cars.filter((c) => c.title.toLowerCase().includes(model));
  if (city) cars = cars.filter((c) => c.city.toLowerCase().includes(city));
  if (fuel) cars = cars.filter((c) => (c.fuel ?? '').toLowerCase().includes(fuel));
  if (!Number.isNaN(year)) cars = cars.filter((c) => c.year >= year);
  if (!Number.isNaN(mileage)) cars = cars.filter((c) => c.mileageKm <= mileage);
  if (!Number.isNaN(priceFrom)) cars = cars.filter((c) => c.price >= priceFrom);
  if (!Number.isNaN(priceTo)) cars = cars.filter((c) => c.price <= priceTo);

  cars = cars.slice(0, limit);

  return (
    <Section title={title}>
      {withSidebarHint ? (
        <div className="mb-3 rounded-xl border bg-slate-50 p-3 text-sm text-slate-600">
          Вариант 2 поиска (как на wireframe): слева будет сайдбар фильтров. В демо — подсказка.
        </div>
      ) : null}

      {(type || brand || model || city || fuel || !Number.isNaN(year) || !Number.isNaN(mileage) || !Number.isNaN(priceFrom) || !Number.isNaN(priceTo)) ? (
        <div className="mb-4 rounded-xl border bg-white p-3 text-sm text-slate-600">
          Применены фильтры (demo):{' '}
          <span className="font-medium">
            {[
              type ? `type=${type}` : null,
              brand ? `brand=${brand}` : null,
              model ? `model=${model}` : null,
              year ? `year>=${year}` : null,
              mileage ? `km<=${mileage}` : null,
              fuel ? `fuel=${fuel}` : null,
              city ? `city=${city}` : null,
              !Number.isNaN(priceFrom) ? `price>=${priceFrom}` : null,
              !Number.isNaN(priceTo) ? `price<=${priceTo}` : null
            ]
              .filter(Boolean)
              .join(', ')}
          </span>
        </div>
      ) : null}

      {cars.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">Ничего не найдено (demo).</div>
      ) : (
        <div className="space-y-3">
          {cars.map((car) => (
            <Link
              key={car.id}
              href={`/cars/${car.id}`}
              className="flex gap-3 rounded-2xl border bg-white p-3 shadow-sm hover:shadow"
            >
              <div className="h-24 w-36 flex-none overflow-hidden rounded-xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{car.title}</div>
                    <div className="text-xs text-slate-500">
                      {car.city} • {car.year} • {car.mileageKm.toLocaleString()} km
                    </div>
                  </div>
                  <div className="font-bold whitespace-nowrap">
                    {car.price.toLocaleString()} {car.currency}
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  Топливо: {car.fuel ?? '—'} • КПП: {car.gearbox ?? '—'} • Тип: {car.vehicleType ?? 'car'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
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
  const reels = config.demoData.reels;
  const right = moreLabel && moreHref ? <MoreLink label={moreLabel} href={moreHref} /> : null;

  return (
    <Section title={title} align="center" right={right}>
      <ReelsStripClient reels={reels} showArrows={showArrows} />
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
        <div className="mx-auto max-w-[960px] overflow-hidden rounded-[12px] border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
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
  ctx?: { carId?: string; search?: Record<string, string | string[] | undefined> };
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
      return (
        <SearchWidget
          title={String(p.title ?? '')}
          cta={String(p.cta ?? '')}
          mode={String(p.mode ?? '')}
          initial={ctx?.search}
        />
      );
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
          search={ctx?.search}
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
