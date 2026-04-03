'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SiteConfig } from '@/lib/site/types';
import type { ListingView } from '@/lib/listings/types';

type DemoCar = SiteConfig['demoData']['cars'][number];
type SearchMap = Record<string, string | string[] | undefined>;

type ListingsResponse = {
  ok: true;
  listings: ListingView[];
};

function pick1(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

function val(search: SearchMap | undefined, key: string): string {
  return pick1(search?.[key]).trim();
}

function normalizeType(value: string): string {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'bike') return 'motorcycle';
  if (raw === 'bus') return 'truck';
  return raw;
}

function listingThumb(item: ListingView) {
  return item.coverUrl || item.imageUrls?.[0] || '';
}

function listingPrice(item: ListingView) {
  const amount = item.priceAmount ?? item.price;
  const currency = item.priceCurrency || item.currency || '';
  if (amount == null) return 'Цена не указана';
  return `${amount.toLocaleString('ru-RU')} ${currency}`.trim();
}

function listingMeta(item: ListingView) {
  return [
    item.city,
    item.year ? String(item.year) : '',
    item.mileageKm != null ? `${item.mileageKm.toLocaleString('ru-RU')} km` : ''
  ].filter(Boolean).join(' • ');
}

function listingSpecs(item: ListingView) {
  return [
    item.fuelType ? `Топливо: ${item.fuelType}` : '',
    item.transmission ? `КПП: ${item.transmission}` : '',
    item.vehicleCategory ? `Тип: ${item.vehicleCategory}` : ''
  ].filter(Boolean).join(' • ');
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

function DemoResultCard({ car }: { car: DemoCar }) {
  return (
    <article className="rounded-[18px] bg-[#f4f4f4] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
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
    </article>
  );
}

function LiveResultCard({ listing }: { listing: ListingView }) {
  const thumb = listingThumb(listing);

  return (
    <article className="rounded-[18px] bg-[#f4f4f4] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
      <div className="flex gap-5">
        <div className="h-[190px] w-[240px] flex-none overflow-hidden rounded-[8px] bg-white">
          {thumb ? (
            <img src={thumb} alt={listing.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">Нет фото</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-[18px] font-semibold">{listing.title}</div>
              <div className="mt-2 text-[13px] text-slate-600">
                {listingMeta(listing) || 'Объявление'}
              </div>
              <div className="mt-3 text-[14px] text-slate-700">
                {listingSpecs(listing) || 'Характеристики не указаны'}
              </div>
              <div className="mt-5 line-clamp-2 text-[14px] text-slate-700">
                {listing.description || 'Описание объявления'}
              </div>
              <div className="mt-3 text-[12px] text-slate-500">
                {listing.ownerProfile?.displayName || listing.ownerDisplayName || ''}
              </div>
            </div>

            <div className="whitespace-nowrap text-[18px] font-bold">
              {listingPrice(listing)}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function MobileDemoResultCard({ car }: { car: DemoCar }) {
  return (
    <article className="rounded-[16px] bg-[#d7d7d7] p-4">
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
    </article>
  );
}

function MobileLiveResultCard({ listing }: { listing: ListingView }) {
  const thumb = listingThumb(listing);

  return (
    <article className="rounded-[16px] bg-[#d7d7d7] p-4">
      <div className="flex gap-3">
        <div className="h-[95px] w-[95px] flex-none overflow-hidden rounded-[8px] bg-white">
          {thumb ? (
            <img src={thumb} alt={listing.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[12px] text-slate-500">Нет фото</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="truncate text-[15px] font-semibold">{listing.title}</div>
            <div className="whitespace-nowrap text-[15px] font-bold">{listingPrice(listing)}</div>
          </div>

          <div className="mt-1 text-[11px] text-slate-700">
            {listingMeta(listing) || 'Объявление'}
          </div>

          <div className="mt-2 text-[12px] text-slate-700">
            {listingSpecs(listing) || 'Характеристики не указаны'}
          </div>

          <div className="mt-2 line-clamp-2 text-[13px] text-slate-800">
            {listing.description || 'Описание'}
          </div>
        </div>
      </div>
    </article>
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

function DemoHotOfferCard({ car }: { car: DemoCar }) {
  return (
    <article className="overflow-hidden rounded-[10px] border border-black/10 bg-[#a6a6a6]">
      <div className="aspect-square bg-white">
        <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
      </div>
      <div className="flex h-[78px] items-center justify-center px-3 text-center text-[12px] text-white">Описание</div>
    </article>
  );
}

function LiveHotOfferCard({ listing }: { listing: ListingView }) {
  const thumb = listingThumb(listing);

  return (
    <article className="overflow-hidden rounded-[10px] border border-black/10 bg-[#a6a6a6]">
      <div className="aspect-square bg-white">
        {thumb ? (
          <img src={thumb} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">Нет фото</div>
        )}
      </div>
      <div className="flex h-[78px] items-center justify-center px-3 text-center text-[12px] text-white">
        {listing.title}
      </div>
    </article>
  );
}

function searchToQuery(search?: SearchMap): string {
  const params = new URLSearchParams();

  const type = normalizeType(val(search, 'type'));
  const brand = val(search, 'brand');
  const model = val(search, 'model');
  const year = val(search, 'year');
  const mileageKm = val(search, 'mileageKm');
  const fuel = val(search, 'fuel');
  const city = val(search, 'city');
  const priceFrom = val(search, 'priceFrom');
  const priceTo = val(search, 'priceTo');

  if (type) params.set('type', type);
  if (brand) params.set('brand', brand);
  if (model) params.set('model', model);
  if (year) params.set('year', year);
  if (mileageKm) params.set('mileageKm', mileageKm);
  if (fuel) params.set('fuel', fuel);
  if (city) params.set('city', city);
  if (priceFrom) params.set('priceFrom', priceFrom);
  if (priceTo) params.set('priceTo', priceTo);

  return params.toString();
}

export function SearchResultsModeClient({
  active,
  demoCars,
  search
}: {
  active: boolean;
  demoCars: DemoCar[];
  search?: SearchMap;
}) {
  const [loading, setLoading] = useState(true);
  const [liveListings, setLiveListings] = useState<ListingView[]>([]);

  const queryString = useMemo(() => searchToQuery(search), [search]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const url = queryString ? `/api/listings?${queryString}` : '/api/listings';
        const res = await fetch(url, {
          cache: 'no-store',
          credentials: 'include'
        });

        const data = (await res.json().catch(() => ({}))) as Partial<ListingsResponse>;
        if (!alive) return;

        if (res.ok && Array.isArray(data.listings)) {
          setLiveListings(data.listings);
        } else {
          setLiveListings([]);
        }
      } catch {
        if (!alive) return;
        setLiveListings([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [queryString]);

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
                {loading ? (
                  <div className="rounded-[18px] bg-[#f4f4f4] p-6 text-slate-600 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
                    Загрузка объявлений…
                  </div>
                ) : liveListings.length > 0 ? (
                  liveListings.map((listing) => <LiveResultCard key={listing.id} listing={listing} />)
                ) : (
                  <div className="rounded-[18px] bg-[#f4f4f4] p-6 text-slate-600 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
                    По вашему запросу объявлений не найдено.
                  </div>
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
              {loading ? (
                <div className="rounded-[14px] bg-[#d7d7d7] p-4 text-slate-700">
                  Загрузка объявлений…
                </div>
              ) : liveListings.length > 0 ? (
                liveListings.map((listing) => <MobileLiveResultCard key={listing.id} listing={listing} />)
              ) : (
                <div className="rounded-[14px] bg-[#d7d7d7] p-4 text-slate-700">
                  По вашему запросу объявлений не найдено.
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  const hotListings = liveListings.slice(0, 3);
  const listListings = liveListings.slice(0, 5);
  const hotDemo = demoCars.slice(0, 3);
  const listDemo = demoCars.slice(0, 5);

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
              {!loading && hotListings.length > 0
                ? hotListings.map((listing) => <LiveHotOfferCard key={listing.id} listing={listing} />)
                : hotDemo.map((car) => <DemoHotOfferCard key={car.id} car={car} />)}
            </div>

            <div className="mt-3 flex justify-end">
              <Link href="/search" className="flex items-center gap-1 text-[14px] text-slate-700">
                Больше
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {!loading && listListings.length > 0
              ? listListings.map((listing) => <LiveResultCard key={listing.id} listing={listing} />)
              : listDemo.map((car) => <DemoResultCard key={car.id} car={car} />)}
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

              {!loading && hotListings[0] ? <LiveHotOfferCard listing={hotListings[0]} /> : hotDemo[0] ? <DemoHotOfferCard car={hotDemo[0]} /> : null}
            </div>

            <div className="mt-3 flex justify-end">
              <Link href="/search" className="flex items-center gap-1 text-[14px] text-slate-700">
                Больше
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {!loading && listListings.length > 0
              ? listListings.map((listing) => <MobileLiveResultCard key={listing.id} listing={listing} />)
              : listDemo.map((car) => <MobileDemoResultCard key={car.id} car={car} />)}
          </div>
        </div>
      </div>
    </>
  );
}