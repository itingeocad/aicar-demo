import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session.server';
import { createListing, listPublicListings } from '@/lib/listings/store.server';
import type { CreateListingInput, ListingView } from '@/lib/listings/types';

export const dynamic = 'force-dynamic';

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function str(value: unknown) {
  return String(value ?? '').trim();
}

function num(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeType(value: string) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'bike') return 'motorcycle';
  if (raw === 'bus') return 'truck';
  return raw;
}

function matchesText(value: string | undefined, filter: string | null) {
  if (!filter) return true;
  return String(value || '').trim().toLowerCase().includes(filter.trim().toLowerCase());
}

function typeMatches(queryType: string | null, rawItemType: string) {
  const q = normalizeType(String(queryType || ''));
  if (!q) return true;

  const itemType = normalizeType(rawItemType || 'car');

  if (q === 'car') {
    return itemType === 'car' || itemType === 'suv';
  }

  return itemType === q;
}

function matchesListing(listing: ListingView, url: URL) {
  const type = url.searchParams.get('type');
  const category = url.searchParams.get('category');
  const brand = url.searchParams.get('brand');
  const model = url.searchParams.get('model');
  const year = url.searchParams.get('year');
  const mileageKm = url.searchParams.get('mileageKm');
  const fuel = url.searchParams.get('fuel');
  const city = url.searchParams.get('city');
  const region = url.searchParams.get('region');
  const priceFrom = num(url.searchParams.get('priceFrom'));
  const priceTo = num(url.searchParams.get('priceTo'));

  const listingCategory = normalizeType(String(listing.vehicleCategory || 'car'));
  const listingBrand = String(listing.brandId || listing.brand || '').toLowerCase();
  const listingModel = String(listing.modelId || listing.model || '').toLowerCase();
  const listingFuel = String(listing.fuelType || '').toLowerCase();
  const listingCity = String(listing.city || '').toLowerCase();
  const listingRegion = String(listing.regionId || '').toLowerCase();
  const listingPrice = listing.priceAmount ?? listing.price ?? null;

  if (!typeMatches(type, listingCategory)) return false;
  if (category && !typeMatches(category, listingCategory)) return false;
  if (brand && !listingBrand.includes(brand.toLowerCase()) && !String(listing.brand || '').toLowerCase().includes(brand.toLowerCase())) return false;
  if (model && !listingModel.includes(model.toLowerCase()) && !String(listing.model || '').toLowerCase().includes(model.toLowerCase())) return false;
  if (year && Number(listing.year || 0) !== Number(year)) return false;

  if (mileageKm) {
    const maxMileage = num(mileageKm);
    if (maxMileage != null && listing.mileageKm != null && Number(listing.mileageKm) > maxMileage) {
      return false;
    }
  }

  if (fuel && listingFuel !== fuel.toLowerCase()) return false;
  if (city && !matchesText(listingCity, city)) return false;
  if (region && listingRegion !== region.toLowerCase()) return false;

  if (priceFrom != null && listingPrice != null && listingPrice < priceFrom) return false;
  if (priceTo != null && listingPrice != null && listingPrice > priceTo) return false;

  return true;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const listings = await listPublicListings();
  const filtered = listings.filter((item) => matchesListing(item, url));
  return NextResponse.json({ ok: true, listings: filtered });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as CreateListingInput | null;

  const title = str(body?.title);
  if (!title) {
    return NextResponse.json({ error: 'title required' }, { status: 400 });
  }

  const imageUrls = Array.isArray(body?.imageUrls) ? body!.imageUrls.map(String).filter(Boolean) : [];
  if (imageUrls.some((x) => !isHttpUrl(x))) {
    return NextResponse.json({ error: 'imageUrls must be http/https URLs' }, { status: 400 });
  }

  const coverUrl = str(body?.coverUrl);
  if (coverUrl && !isHttpUrl(coverUrl)) {
    return NextResponse.json({ error: 'coverUrl must be http/https URL' }, { status: 400 });
  }

  const listing = await createListing({
    ownerUid: session.uid,
    ownerDisplayName: session.displayName,
    title,
    description: body?.description,
    price: body?.price,
    currency: body?.currency,
    city: body?.city,
    brand: body?.brand,
    model: body?.model,
    year: body?.year,
    coverUrl,
    imageUrls,
    visibility: body?.visibility === 'public' ? 'public' : 'draft',
    commentsEnabled: body?.commentsEnabled,
    listingType: body?.listingType,
    vehicleCategory: body?.vehicleCategory,
    brandId: body?.brandId,
    modelId: body?.modelId,
    mileageKm: body?.mileageKm,
    drivetrain: body?.drivetrain,
    fuelType: body?.fuelType,
    transmission: body?.transmission,
    engine: body?.engine,
    regionId: body?.regionId,
    priceAmount: body?.priceAmount,
    priceCurrency: body?.priceCurrency,
    linkedClipIds: body?.linkedClipIds,
    moderationStatus: body?.moderationStatus
  });

  return NextResponse.json({ ok: true, listing });
}