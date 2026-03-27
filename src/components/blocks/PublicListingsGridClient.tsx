'use client';

import type { DemoCar } from '@/lib/site/types';
import type { ListingView } from '@/lib/listings/types';
import { useEffect, useState } from 'react';

type ListingsResponse = {
  ok: true;
  listings: ListingView[];
};

function listingThumb(item: ListingView) {
  return item.coverUrl || item.imageUrls?.[0] || '';
}

function DemoCarCard({ car }: { car: DemoCar }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="aspect-[4/3] bg-slate-100">
        <img src={car.imageUrl} alt={car.title} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <div className="text-[18px] font-semibold leading-[1.15] text-slate-900">{car.title}</div>
        <div className="mt-2 text-[14px] text-slate-600">
          {car.city} • {car.year} • {car.mileageKm.toLocaleString()} km
        </div>
        <div className="mt-3 text-[18px] font-semibold text-slate-900">
          {car.price.toLocaleString('ru-RU')} {car.currency}
        </div>
      </div>
    </article>
  );
}

function ListingCard({ listing }: { listing: ListingView }) {
  const thumb = listingThumb(listing);

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="aspect-[4/3] bg-slate-100">
        {thumb ? (
          <img src={thumb} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Нет фото</div>
        )}
      </div>

      <div className="p-4">
        <div className="text-[18px] font-semibold leading-[1.15] text-slate-900">{listing.title}</div>

        <div className="mt-2 text-[14px] text-slate-600">
          {[listing.brand, listing.model, listing.year, listing.city].filter(Boolean).join(' • ') || 'Объявление'}
        </div>

        {listing.description ? (
          <div className="mt-3 line-clamp-3 text-[14px] leading-[1.4] text-slate-700">
            {listing.description}
          </div>
        ) : null}

        {listing.price ? (
          <div className="mt-3 text-[18px] font-semibold text-slate-900">
            {listing.price.toLocaleString('ru-RU')} {listing.currency || 'EUR'}
          </div>
        ) : null}

        <div className="mt-3 text-[12px] text-slate-500">
          {listing.ownerProfile?.displayName || listing.ownerDisplayName}
        </div>
      </div>
    </article>
  );
}

export function PublicListingsGridClient({
  demoCars,
  limit
}: {
  demoCars: DemoCar[];
  limit: number;
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: Math.max(1, limit) }).map((_, idx) => (
          <div key={idx} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="aspect-[4/3] animate-pulse bg-slate-200" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (liveListings.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {liveListings.slice(0, limit).map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {demoCars.slice(0, limit).map((car) => (
        <DemoCarCard key={car.id} car={car} />
      ))}
    </div>
  );
}