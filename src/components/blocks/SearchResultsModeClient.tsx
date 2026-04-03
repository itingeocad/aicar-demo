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

function numOrNaN(v: string): number {
  const cleaned = String(v ?? '').replace(/[^\d.]/g, '').trim();
  if (!cleaned) return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function normalizeText(v: unknown): string {
  return String(v ?? '').trim().toLowerCase();
}

function normalizeType(value: string): string {
  const raw = normalizeText(value);
  if (raw === 'bike') return 'motorcycle';
  if (raw === 'bus') return 'truck';
  return raw;
}

function includesSoft(hay: unknown, needle: string): boolean {
  const h = normalizeText(hay);
  const n = normalizeText(needle);
  if (!n) return true;
  return h.includes(n);
}

function typeMatches(queryType: string, rawItemType: string): boolean {
  if (!queryType) return true;

  const itemType = normalizeType(rawItemType || 'car');

  if (queryType === 'car') {
    return itemType === 'car' || itemType === 'suv';
  }

  return itemType === queryType;
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

function demoBrand(car: DemoCar): string {
  const direct = (car as any).brand;
  if (direct) return String(direct);
  return String(car.title || '').split(' ')[0] || '';
}

function demoModel(car: DemoCar): string {
  const direct = (car as any).model;
  if (direct) return String(direct);
  const parts = String(car.title || '').split(' ');
  return parts.slice(1).join(' ');
}

function matchesListing(item: ListingView, search?: SearchMap): boolean {
  const type = normalizeType(val(search, 'type'));
  const brand = normalizeText(val(search, 'brand'));
  const model = normalizeText(val(search, 'model'));
  const fuel = normalizeText(val(search, 'fuel'));
  const city = normalizeText(val(search, 'city'));

  const year = numOrNaN(val(search, 'year'));
  const mileageKm = numOrNaN(val(search, 'mileageKm'));
  const priceFrom = numOrNaN(val(search, 'priceFrom'));
  const priceTo = numOrNaN(val(search, 'priceTo'));

  const itemType = normalizeType(String(item.vehicleCategory || 'car'));
  const itemBrand = normalizeText(item.brandId || item.brand || '');
  const itemModel = normalizeText(item.modelId || item.model || '');
  const itemFuel = normalizeText(item.fuelType || '');
  const itemCity = normalizeText(item.city || '');
  const itemYear = Number(item.year || 0);
  const itemMileage = Number(item.mileageKm || 0);
  const itemPrice = Number(item.priceAmount ?? item.price ?? NaN);

  if (!typeMatches(type, itemType)) return false;
  if (brand && !includesSoft(itemBrand, brand) && !includesSoft(item.brand, brand)) return false;
  if (model && !includesSoft(itemModel, model) && !includesSoft(item.model, model)) return false;
  if (fuel && !includesSoft(itemFuel, fuel)) return false;
  if (city && !includesSoft(itemCity, city)) return false;

  if (!Number.isNaN(year) && itemYear && itemYear !== year) return false;
  if (!Number.isNaN(mileageKm) && itemMileage && itemMileage > mileageKm) return false;
  if (!Number.isNaN(priceFrom) && !Number.isNaN(itemPrice) && itemPrice < priceFrom) return false;
  if (!Number.isNaN(priceTo) && !Number.isNaN(itemPrice) && itemPrice > priceTo) return false;

  return true;
}

function matchesDemoCar(car: DemoCar, search?: SearchMap): boolean {
  const type = normalizeType(val(search, 'type'));
  const brand = normalizeText(val(search, 'brand'));
  const model = normalizeText(val(search, 'model'));
  const fuel = normalizeText(val(search, 'fuel'));
  const city = normalizeText(val(search, 'city'));

  const year = numOrNaN(val(search, 'year'));
  const mileageKm = numOrNaN(val(search, 'mileageKm'));
  const priceFrom = numOrNaN(val(search, 'priceFrom'));
  const priceTo = numOrNaN(val(search, 'priceTo'));

  const carType = normalizeType(String((car as any).vehicleType || 'car'));
  const carBrand = normalizeText(demoBrand(car));
  const carModel = normalizeText(demoModel(car));
  const carFuel = normalizeText((car as any).fuel || '');
  const carCity = normalizeText(car.city || '');
  const carYear = Number(car.year || 0);
  const carMileage = Number(car.mileageKm || 0);
  const carPrice = Number(car.price || NaN);

  if (!typeMatches(type, carType)) return false;
  if (brand && !includesSoft(carBrand, brand) && !includesSoft(car.title, brand)) return false;
  if (model && !includesSoft(carModel, model) && !includesSoft(car.title, model)) return false;
  if (fuel && !includesSoft(carFuel, fuel)) return false;
  if (city && !includesSoft(carCity, city)) return false;

  if (!Number.isNaN(year) && carYear && carYear !== year) return false;
  if (!Number.isNaN(mileageKm) && carMileage && carMileage > mileageKm) return false;
  if (!Number.isNaN(priceFrom) && !Number.isNaN(carPrice) && carPrice < priceFrom) return false;
  if (!Number.isNaN(priceTo) && !Number.isNaN(carPrice) && carPrice > priceTo) return false;

  return true;
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
                Топливо: {(car as any).fuel} • КПП: {(car as any).gearbox} • Тип: {(car as any).vehicleType ?? 'car'}
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
            Топливо: {(car as any).fuel} • КПП: {(car as any).gearbox} • Тип: {(car as any).vehicleType ?? 'car'}
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

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const res = await fetch('/api/listings', {
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
  }, []);

  const filteredLive = useMemo(
    () => liveListings.filter((item) => matchesListing(item, search)),
    [liveListings, search]
  );

  const listLive = useMemo(() => liveListings.slice(0, 5), [liveListings]);
  const hotDemo = useMemo(() => demoCars.slice(0, 3), [demoCars]);
  const listDemo = useMemo(() => demoCars.slice(0, 5), [demoCars]);

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
                ) : filteredLive.length > 0 ? (
                  filteredLive.map((listing) => <LiveResultCard key={listing.id} listing={listing} />)
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
              ) : filteredLive.length > 0 ? (
                filteredLive.map((listing) => <MobileLiveResultCard key={listing.id} listing={listing} />)
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
              {hotDemo.map((car) => <DemoHotOfferCard key={car.id} car={car} />)}
            </div>

            <div className="mt-3 flex justify-end">
              <Link href="/search" className="flex items-center gap-1 text-[14px] text-slate-700">
                Больше
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {!loading && listLive.length > 0
              ? listLive.map((listing) => <LiveResultCard key={listing.id} listing={listing} />)
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

              {hotDemo[0] ? <DemoHotOfferCard car={hotDemo[0]} /> : null}
            </div>

            <div className="mt-3 flex justify-end">
              <Link href="/search" className="flex items-center gap-1 text-[14px] text-slate-700">
                Больше
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {!loading && listLive.length > 0
              ? listLive.map((listing) => <MobileLiveResultCard key={listing.id} listing={listing} />)
              : listDemo.map((car) => <MobileDemoResultCard key={car.id} car={car} />)}
          </div>
        </div>
      </div>
    </>
  );
}