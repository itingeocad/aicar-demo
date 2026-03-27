import { getRedis } from '@/lib/kv/upstash.server';
import { getProfileByUid } from '@/lib/aiclips/store.server';
import type { ListingDoc, ListingView, ListingVisibility } from './types';

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

async function buildListingView(listing: ListingDoc): Promise<ListingView> {
  const ownerProfile = await getProfileByUid(listing.ownerUid);

  return {
    ...listing,
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
  return await readJson<ListingDoc | null>(listingKey(id), null);
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
  return all.filter((x) => x.visibility === 'public');
}

export async function listUserListings(uid: string): Promise<ListingView[]> {
  const ids = await readIdList(userListingsKey(uid));
  return await loadListingsByIds(ids);
}

export async function createListing(input: {
  ownerUid: string;
  ownerDisplayName: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  city?: string;
  brand?: string;
  model?: string;
  year?: number;
  coverUrl?: string;
  imageUrls?: string[];
  visibility?: ListingVisibility;
}): Promise<ListingView> {
  const now = new Date().toISOString();

  const imageUrls = Array.isArray(input.imageUrls)
    ? input.imageUrls.map((x) => String(x || '').trim()).filter(Boolean)
    : [];

  const listing: ListingDoc = {
    id: crypto.randomUUID(),
    ownerUid: input.ownerUid,
    ownerDisplayName: input.ownerDisplayName,
    title: String(input.title || '').trim(),
    description: String(input.description || '').trim(),
    price: Number.isFinite(Number(input.price)) ? Number(input.price) : undefined,
    currency: String(input.currency || '').trim() || 'EUR',
    city: String(input.city || '').trim(),
    brand: String(input.brand || '').trim(),
    model: String(input.model || '').trim(),
    year: Number.isFinite(Number(input.year)) ? Number(input.year) : undefined,
    coverUrl: String(input.coverUrl || imageUrls[0] || '').trim(),
    imageUrls,
    visibility: input.visibility === 'draft' ? 'draft' : 'public',
    createdAt: now,
    updatedAt: now
  };

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
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  city?: string;
  brand?: string;
  model?: string;
  year?: number;
  coverUrl?: string;
  imageUrls?: string[];
  visibility?: ListingVisibility;
}): Promise<ListingView | null> {
  const current = await getListingById(input.listingId);
  if (!current) return null;
  if (current.ownerUid !== input.uid) return null;

  const imageUrls = Array.isArray(input.imageUrls)
    ? input.imageUrls.map((x) => String(x || '').trim()).filter(Boolean)
    : current.imageUrls;

  const next: ListingDoc = {
    ...current,
    title: String(input.title ?? current.title).trim() || current.title,
    description: String(input.description ?? current.description ?? '').trim(),
    price: input.price == null ? current.price : Number(input.price),
    currency: String(input.currency ?? current.currency ?? 'EUR').trim() || 'EUR',
    city: String(input.city ?? current.city ?? '').trim(),
    brand: String(input.brand ?? current.brand ?? '').trim(),
    model: String(input.model ?? current.model ?? '').trim(),
    year: input.year == null ? current.year : Number(input.year),
    coverUrl: String(input.coverUrl ?? current.coverUrl ?? imageUrls[0] ?? '').trim(),
    imageUrls,
    visibility: input.visibility === 'draft' ? 'draft' : 'public',
    updatedAt: new Date().toISOString()
  };

  await writeJson(listingKey(next.id), next);
  return await buildListingView(next);
}