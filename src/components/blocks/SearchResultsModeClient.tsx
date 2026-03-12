'use client';

import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { SiteConfig } from '@/lib/site/types';

type Car = SiteConfig['demoData']['cars'][number];
type SearchMap = Record<string, string | string[] | undefined>;

function pick1(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

function val(search: SearchMap | undefined, key: string): string {
  return pick1(search?.[key]).trim();
}

function FilterField({
  label,
  name,
  defaultValue
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[12px] text-slate-700">{label}</div>
      <input
        name={name}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-[8px] border border-black/10 bg-white px-3 text-[14px] outline-none"
      />
    </label>
  );
}

function ResultCard({ car }: { car: Car }) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="block rounded-[18px] bg-[#f4f4f4] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
    >
      <div className="flex gap-5">
        <div className="h-[190px] w-[240px] flex-none overflow-hidden rounded-[8px] bg-white">
          <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-[18px] font-semibold">{car.title}</div>
              <div className="mt-2 text-[13px] text-slate-600">
                {car.city} • {car.year} • {car.mileageKm.toLocaleString()} km
              </div>
              <div className="mt-3 text-[14px] text-slate-700">
                Топливо: {car.fuel} • КПП: {car.gearbox} • Тип: {car.vehicleType ?? 'car'}
              </div>
              <div className="mt-5 text-[14px] text-slate-700">Описание объявления</div>
            </div>

            <div className="whitespace-nowrap text-[18px] font-bold">
              {car.price.toLocaleString()} {car.currency}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MobileResultCard({ car }: { car: Car }) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="block rounded-[16px] bg-[#d7d7d7] p-4"
    >
      <div className="flex gap-3">
        <div className="h-[95px] w-[95px] flex-none overflow-hidden rounded-[8px] bg-white">
          <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="truncate text-[15px] font-semibold">{car.title}</div>
            <div className="whitespace-nowrap text-[15px] font-bold">{car.price.toLocaleString()} {car.currency}</div>
          </div>
          <div className="mt-1 text-[11px] text-slate-700">
            {car.city} • {car.year} • {car.mileageKm.toLocaleString()} km
          </div>
          <div className="mt-2 text-[12px] text-slate-700">
            Топливо: {car.fuel} • КПП: {car.gearbox} • Тип: {car.vehicleType ?? 'car'}
          </div>
          <div className="mt-2 text-[13px] text-slate-800">Описание</div>
        </div>
      </div>
    </Link>
  );
}

function CompactFilterForm({
  search,
  mobile = false
}: {
  search?: SearchMap;
  mobile?: boolean;
}) {
  const type = val(search, 'type');

  return (
    <form action="/search" method="GET" className="space-y-4">
      {type ? <input type="hidden" name="type" value={type} /> : null}

      <FilterField label="Марка" name="brand" defaultValue={val(search, 'brand')} />
      <FilterField label="Модель" name="model" defaultValue={val(search, 'model')} />
      <FilterField label="Год выпуска" name="year" defaultValue={val(search, 'year')} />
      <FilterField label="Километраж" name="mileageKm" defaultValue={val(search, 'mileageKm')} />
      <FilterField label="Тип топлива" name="fuel" defaultValue={val(search, 'fuel')} />
      <FilterField label="Город" name="city" defaultValue={val(search, 'city')} />

      <div className="grid grid-cols-2 gap-3">
        <FilterField label="Цена от" name="priceFrom" defaultValue={val(search, 'priceFrom')} />
        <FilterField label="Цена до" name="priceTo" defaultValue={val(search, 'priceTo')} />
      </div>

      <button
        type="submit"
        className={mobile ? 'w-full rounded-[10px] bg-[#7f889c] px-4 py-3 text-white' : 'w-full rounded-[10px] bg-[#7f889c] px-4 py-3 text-white'}
      >
        Найти авто
      </button>
    </form>
  );
}

function HotOfferCard({ car }: { car: Car }) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="block overflow-hidden rounded-[10px] border border-black/10 bg-[#a6a6a6]"
    >
      <div className="aspect-square bg-white">
        <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
      </div>
      <div className="flex h-[78px] items-center justify-center px-3 text-center text-[12px] text-white">Описание</div>
    </Link>
  );
}

export function SearchResultsModeClient({
  active,
  cars,
  search
}: {
  active: boolean;
  cars: Car[];
  search?: SearchMap;
}) {
  if (active) {
    return (
      <>
        <div className="hidden md:block">
          <div className="aicar-container py-8">
            <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-8">
              <aside className="pt-1">
                <div className="mb-5 text-[18px] font-semibold">Фильтр поиска</div>
                <CompactFilterForm search={search} />
              </aside>

              <div className="space-y-5">
                {cars.length === 0 ? (
                  <div className="rounded-[18px] bg-[#f4f4f4] p-6 text-slate-600 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
                    Ничего не найдено (demo).
                  </div>
                ) : (
                  cars.map((car) => <ResultCard key={car.id} car={car} />)
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="aicar-container py-5">
            <details className="mb-5">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-[18px] font-medium [&::-webkit-details-marker]:hidden">
                Фильтр
                <ChevronDown className="h-4 w-4" />
              </summary>
              <div className="mt-4">
                <CompactFilterForm search={search} mobile />
              </div>
            </details>

            <div className="space-y-4">
              {cars.length === 0 ? (
                <div className="rounded-[14px] bg-[#d7d7d7] p-4 text-slate-700">
                  Ничего не найдено (demo).
                </div>
              ) : (
                cars.map((car) => <MobileResultCard key={car.id} car={car} />)
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  const hot = cars.slice(0, 3);
  const list = cars.slice(0, 5);

  return (
    <>
      <div className="hidden md:block">
        <div className="aicar-container py-4">
          <div className="relative rounded-[18px] bg-[#f4f4f4] p-6 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
            <button type="button" aria-label="prev" className="absolute -left-12 top-1/2 -translate-y-1/2 text-slate-400">
              <ChevronLeft className="h-12 w-12" />
            </button>
            <button type="button" aria-label="next" className="absolute -right-12 top-1/2 -translate-y-1/2 text-slate-400">
              <ChevronRight className="h-12 w-12" />
            </button>

            <div className="mb-6 text-center text-[20px] font-semibold">Горячие предложения</div>

            <div className="grid grid-cols-3 gap-8">
              {hot.map((car) => (
                <HotOfferCard key={car.id} car={car} />
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <Link href="/search" className="flex items-center gap-1 text-[14px] text-slate-700">
                Больше
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {list.map((car) => (
              <ResultCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="aicar-container py-4">
          <div className="mb-8">
            <div className="mb-4 text-center text-[18px] font-semibold">Горячие предложения</div>

            <div className="relative mx-auto max-w-[200px]">
              <button type="button" aria-label="prev" className="absolute -left-14 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronLeft className="h-12 w-12" />
              </button>
              <button type="button" aria-label="next" className="absolute -right-14 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronRight className="h-12 w-12" />
              </button>

              {hot[0] ? <HotOfferCard car={hot[0]} /> : null}
            </div>

            <div className="mt-3 flex justify-end">
              <Link href="/search" className="flex items-center gap-1 text-[14px] text-slate-700">
                Больше
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {list.map((car) => (
              <MobileResultCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}