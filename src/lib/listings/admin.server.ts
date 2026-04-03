import { getRedis } from '@/lib/kv/upstash.server';
import { getListingById, getListingViewById } from '@/lib/listings/store.server';
import type { ListingDoc, ListingModerationStatus, ListingView } from '@/lib/listings/types';

function listingsIndexKey() {
  return 'aicar:listings:index';
}

function listingKey(id: string) {
  return `aicar:listings:by-id:${id}`;
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

export async function listAllListings(): Promise<ListingView[]> {
  const ids = await readIdList(listingsIndexKey());
  const views = await Promise.all(ids.map((id) => getListingViewById(id)));
  return sortNewestFirst(views.filter(Boolean) as ListingView[]);
}

export async function moderateListing(input: {
  listingId: string;
  moderationStatus: Extract<ListingModerationStatus, 'approved' | 'rejected' | 'unpublished'>;
  adminUid: string;
  rejectionReason?: string | null;
}): Promise<ListingView | null> {
  const current = await getListingById(input.listingId);
  if (!current) return null;

  const now = new Date().toISOString();
  let next: ListingDoc = {
    ...current,
    updatedAt: now
  };

  if (input.moderationStatus === 'approved') {
    next = {
      ...next,
      visibility: 'public',
      moderationStatus: 'approved',
      publishedAt: current.publishedAt || now,
      approvedAt: now,
      approvedBy: input.adminUid,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null
    };
  } else if (input.moderationStatus === 'rejected') {
    next = {
      ...next,
      moderationStatus: 'rejected',
      publishedAt: null,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: now,
      rejectedBy: input.adminUid,
      rejectionReason: String(input.rejectionReason || '').trim() || null
    };
  } else {
    next = {
      ...next,
      moderationStatus: 'unpublished',
      publishedAt: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null
    };
  }

  await writeJson(listingKey(next.id), next);
  return await getListingViewById(next.id);
}