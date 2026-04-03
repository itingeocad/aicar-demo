import { getRedis } from '@/lib/kv/upstash.server';
import { getProfileByUid } from '@/lib/aiclips/store.server';
import type {
  CreateListingInput,
  ListingDoc,
  ListingModerationStatus,
  ListingView,
  ListingVisibility,
  PriceCurrency,
  UpdateListingInput
} from './types';

function listingKey(id: string) {
  return `aicar:listings:by-id:${id}`;
}

function listingsIndexKey() {
  return 'aicar:listings:index';
}

function userListingsKey(uid: string) {
  return `aicar:listings:user:${uid}`;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const redis = getRedis();
  if (!redis) return fallback;

  const raw = await redis.get(key);
  if (raw == null) return fallback;

  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  return raw as T;
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(key, JSON.stringify(value));
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set((values || []).map((x) => String(x).trim()).filter(Boolean)));
}

async function readIdList(key: string): Promise<string[]> {
  return uniqueStrings(await readJson<string[]>(key, []));
}

function sortNewestFirst<T extends { createdAt: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''));
}

function str(value: unknown, fallback = ''): string {
  return String(value ?? fallback).trim();
}

function optionalStr(value: unknown): string | undefined {
  const s = str(value);
  return s || undefined;
}

function nullableNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function nullablePositiveInt(value: unknown): number | null {
  const n = nullableNumber(value);
  if (n == null) return null;
  return Math.max(0, Math.trunc(n));
}

function normalizeVisibility(value: unknown, fallback: ListingVisibility = 'draft'): ListingVisibility {
  return value === 'public' ? 'public' : fallback;
}

function normalizeCurrency(value: unknown): PriceCurrency {
  const v = str(value || 'EUR').toUpperCase();
  if (v === 'USD') return 'USD';
  if (v === 'MDL') return 'MDL';
  return 'EUR';
}

function normalizeModerationStatus(
  value: unknown,
  visibility: ListingVisibility
): ListingModerationStatus {
  if (
    value === 'draft' ||
    value === 'pending' ||
    value === 'approved' ||
    value === 'rejected' ||
    value === 'unpublished'
  ) {
    return value;
  }

  return visibility === 'public' ? 'approved' : 'draft';
}

function resolveCreateModerationStatus(
  visibility: ListingVisibility,
  explicit?: ListingModerationStatus
): ListingModerationStatus {
  if (explicit) return explicit;
  if (visibility === 'draft') return 'draft';
  return 'pending';
}

function resolveUpdatedModerationStatus(
  current: ListingDoc,
  nextVisibility: ListingVisibility,
  explicit?: ListingModerationStatus
): ListingModerationStatus {
  if (explicit) return explicit;
  if (nextVisibility === 'draft') return 'draft';

  const currentStatus = normalizeModerationStatus(current.moderationStatus, current.visibility);

  if (currentStatus === 'draft' && nextVisibility === 'public') {
    return 'pending';
  }

  return currentStatus;
}

function normalizeListing(listing: ListingDoc): ListingDoc {
  const visibility = normalizeVisibility(listing.visibility, 'draft');
  const moderationStatus = normalizeModerationStatus(listing.moderationStatus, visibility);
  const imageUrls = uniqueStrings(Array.isArray(listing.imageUrls) ? listing.imageUrls : []);
  const priceAmount = nullableNumber(listing.priceAmount ?? listing.price);
  const priceCurrency = normalizeCurrency(listing.priceCurrency ?? listing.currency ?? 'EUR');

  return {
    ...listing,
    title: str(listing.title),
    description: str(listing.description),
    city: str(listing.city),
    brand: str(listing.brand),
    model: str(listing.model),
    year: nullablePositiveInt(listing.year),
    coverUrl: str(listing.coverUrl || imageUrls[0] || ''),
    imageUrls,
    visibility,
    commentsEnabled: listing.commentsEnabled !== false,
    commentCount: Math.max(0, Math.trunc(Number(listing.commentCount || 0))),
    listingType: (listing.listingType as any) || undefined,
    vehicleCategory: (listing.vehicleCategory as any) || undefined,
    brandId: optionalStr(listing.brandId),
    modelId: optionalStr(listing.modelId),
    mileageKm: nullablePositiveInt(listing.mileageKm),
    drivetrain: (listing.drivetrain as any) || '',
    fuelType: (listing.fuelType as any) || '',
    transmission: (listing.transmission as any) || '',
    engine: optionalStr(listing.engine),
    regionId: optionalStr(listing.regionId),
    priceAmount,
    priceCurrency,
    price: priceAmount,
    currency: priceCurrency,
    linkedClipIds: uniqueStrings(Array.isArray(listing.linkedClipIds) ? listing.linkedClipIds : []),
    moderationStatus,
    publishedAt: listing.publishedAt || (visibility === 'public' && moderationStatus === 'approved' ? listing.createdAt : null),
    approvedAt: listing.approvedAt || null,
    approvedBy: listing.approvedBy || null,
    rejectedAt: listing.rejectedAt || null,
    rejectedBy: listing.rejectedBy || null,
    rejectionReason: listing.rejectionReason || null
  };
}

function isPubliclyVisible(listing: ListingDoc): boolean {
  const normalized = normalizeListing(listing);
  return normalized.visibility === 'public' && normalized.moderationStatus === 'approved';
}

async function buildListingView(listing: ListingDoc): Promise<ListingView> {
  const normalized = normalizeListing(listing);
  const ownerProfile = await getProfileByUid(normalized.ownerUid);

  return {
    ...normalized,
    ownerProfile: ownerProfile
      ? {
          uid: ownerProfile.uid,
          displayName: ownerProfile.displayName,
          avatarUrl: ownerProfile.avatarUrl
        }
      : undefined
  };
}

export async function getListingById(id: string): Promise<ListingDoc | null> {
  const doc = await readJson<ListingDoc | null>(listingKey(id), null);
  return doc ? normalizeListing(doc) : null;
}

export async function getListingViewById(id: string): Promise<ListingView | null> {
  const doc = await getListingById(id);
  return doc ? await buildListingView(doc) : null;
}

async function loadListingsByIds(ids: string[]): Promise<ListingView[]> {
  const docs = await Promise.all(ids.map((id) => getListingById(id)));
  const filtered = docs.filter(Boolean) as ListingDoc[];
  const sorted = sortNewestFirst(filtered);
  return await Promise.all(sorted.map((item) => buildListingView(item)));
}

export async function listPublicListings(): Promise<ListingView[]> {
  const ids = await readIdList(listingsIndexKey());
  const all = await loadListingsByIds(ids);
  return all.filter((x) => isPubliclyVisible(x));
}

export async function listUserListings(uid: string): Promise<ListingView[]> {
  const ids = await readIdList(userListingsKey(uid));
  return await loadListingsByIds(ids);
}

export async function createListing(input: {
  ownerUid: string;
  ownerDisplayName: string;
} & CreateListingInput): Promise<ListingView> {
  const now = new Date().toISOString();

  const imageUrls = uniqueStrings(Array.isArray(input.imageUrls) ? input.imageUrls : []);
  const visibility = normalizeVisibility(input.visibility, 'draft');
  const priceAmount = nullableNumber(input.priceAmount ?? input.price);
  const priceCurrency = normalizeCurrency(input.priceCurrency ?? input.currency ?? 'EUR');
  const moderationStatus = resolveCreateModerationStatus(visibility, input.moderationStatus);

  const listing: ListingDoc = normalizeListing({
    id: crypto.randomUUID(),
    ownerUid: input.ownerUid,
    ownerDisplayName: str(input.ownerDisplayName),
    ownerAvatarUrl: undefined,

    title: str(input.title),
    description: str(input.description),
    price: priceAmount,
    currency: priceCurrency,
    city: str(input.city),

    brand: str(input.brand),
    model: str(input.model),
    year: nullablePositiveInt(input.year),
    coverUrl: str(input.coverUrl || imageUrls[0] || ''),
    imageUrls,

    visibility,
    commentsEnabled: input.commentsEnabled !== false,
    commentCount: 0,

    createdAt: now,
    updatedAt: now,

    listingType: input.listingType,
    vehicleCategory: input.vehicleCategory,

    brandId: optionalStr(input.brandId),
    modelId: optionalStr(input.modelId),

    mileageKm: nullablePositiveInt(input.mileageKm),
    drivetrain: (input.drivetrain as any) || '',
    fuelType: (input.fuelType as any) || '',
    transmission: (input.transmission as any) || '',
    engine: optionalStr(input.engine),
    regionId: optionalStr(input.regionId),

    priceAmount,
    priceCurrency,

    linkedClipIds: uniqueStrings(Array.isArray(input.linkedClipIds) ? input.linkedClipIds : []),

    moderationStatus,
    publishedAt: moderationStatus === 'approved' && visibility === 'public' ? now : null,
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null
  });

  await writeJson(listingKey(listing.id), listing);

  const index = await readIdList(listingsIndexKey());
  await writeJson(listingsIndexKey(), [listing.id, ...index.filter((x) => x !== listing.id)]);

  const ownerIndex = await readIdList(userListingsKey(listing.ownerUid));
  await writeJson(userListingsKey(listing.ownerUid), [listing.id, ...ownerIndex.filter((x) => x !== listing.id)]);

  return await buildListingView(listing);
}

export async function updateListing(input: {
  listingId: string;
  uid: string;
} & UpdateListingInput): Promise<ListingView | null> {
  const current = await getListingById(input.listingId);
  if (!current) return null;
  if (current.ownerUid !== input.uid) return null;

  const imageUrls = Array.isArray(input.imageUrls)
    ? uniqueStrings(input.imageUrls)
    : current.imageUrls;

  const nextVisibility =
    input.visibility == null
      ? current.visibility
      : normalizeVisibility(input.visibility, current.visibility);

  const nextPriceAmount =
    input.priceAmount === undefined && input.price === undefined
      ? current.priceAmount ?? current.price ?? null
      : nullableNumber(input.priceAmount ?? input.price);

  const nextPriceCurrency =
    input.priceCurrency == null && input.currency == null
      ? normalizeCurrency(current.priceCurrency ?? current.currency ?? 'EUR')
      : normalizeCurrency(input.priceCurrency ?? input.currency ?? 'EUR');

  const next: ListingDoc = normalizeListing({
    ...current,

    title: str(input.title ?? current.title) || current.title,
    description: str(input.description ?? current.description),
    price: nextPriceAmount,
    currency: nextPriceCurrency,
    city: str(input.city ?? current.city),

    brand: str(input.brand ?? current.brand),
    model: str(input.model ?? current.model),
    year: input.year == null ? current.year : nullablePositiveInt(input.year),
    coverUrl: str(input.coverUrl ?? current.coverUrl ?? imageUrls[0] ?? ''),
    imageUrls,

    visibility: nextVisibility,
    commentsEnabled: input.commentsEnabled == null ? current.commentsEnabled !== false : input.commentsEnabled !== false,

    updatedAt: new Date().toISOString(),

    listingType: (input.listingType ?? current.listingType) as any,
    vehicleCategory: (input.vehicleCategory ?? current.vehicleCategory) as any,

    brandId: optionalStr(input.brandId ?? current.brandId),
    modelId: optionalStr(input.modelId ?? current.modelId),

    mileageKm: input.mileageKm == null ? current.mileageKm ?? null : nullablePositiveInt(input.mileageKm),
    drivetrain: ((input.drivetrain ?? current.drivetrain ?? '') as any),
    fuelType: ((input.fuelType ?? current.fuelType ?? '') as any),
    transmission: ((input.transmission ?? current.transmission ?? '') as any),
    engine: optionalStr(input.engine ?? current.engine),
    regionId: optionalStr(input.regionId ?? current.regionId),

    priceAmount: nextPriceAmount,
    priceCurrency: nextPriceCurrency,

    linkedClipIds: Array.isArray(input.linkedClipIds)
      ? uniqueStrings(input.linkedClipIds)
      : uniqueStrings(current.linkedClipIds || []),

    moderationStatus: resolveUpdatedModerationStatus(current, nextVisibility, input.moderationStatus),
    publishedAt:
      resolveUpdatedModerationStatus(current, nextVisibility, input.moderationStatus) === 'approved' && nextVisibility === 'public'
        ? (current.publishedAt || new Date().toISOString())
        : null
  });

  await writeJson(listingKey(next.id), next);
  return await buildListingView(next);
}