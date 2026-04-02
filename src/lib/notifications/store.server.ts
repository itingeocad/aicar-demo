import { getRedis } from '@/lib/kv/upstash.server';
import { getProfileByUid } from '@/lib/aiclips/store.server';
import type { NotificationDoc } from './types';

function notificationsKey(uid: string) {
  return `aicar:notifications:user:${uid}`;
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

function sortNewestFirst<T extends { createdAt: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''));
}

export async function listNotifications(userUid: string): Promise<NotificationDoc[]> {
  const items = await readJson<NotificationDoc[]>(notificationsKey(userUid), []);
  return sortNewestFirst(items);
}

export async function unreadNotificationsCount(userUid: string): Promise<number> {
  const items = await listNotifications(userUid);
  return items.filter((x) => !x.isRead).length;
}

export async function createNotification(input: {
  userUid: string;
  type: NotificationDoc['type'];
  targetType: NotificationDoc['targetType'];
  targetId: string;
  commentId: string;
  actorUid: string;
  actorDisplayName: string;
  textSnippet?: string;
}): Promise<NotificationDoc | null> {
  if (!input.userUid || input.userUid === input.actorUid) return null;

  const current = await listNotifications(input.userUid);
  const actorProfile = await getProfileByUid(input.actorUid);

  const doc: NotificationDoc = {
    id: crypto.randomUUID(),
    userUid: input.userUid,
    type: input.type,
    targetType: input.targetType,
    targetId: input.targetId,
    commentId: input.commentId,
    actorUid: input.actorUid,
    actorDisplayName: actorProfile?.displayName || input.actorDisplayName,
    actorAvatarUrl: actorProfile?.avatarUrl,
    textSnippet: String(input.textSnippet || '').trim().slice(0, 160),
    isRead: false,
    createdAt: new Date().toISOString()
  };

  await writeJson(notificationsKey(input.userUid), [doc, ...current]);
  return doc;
}

export async function markNotificationsRead(userUid: string, ids?: string[]): Promise<void> {
  const current = await listNotifications(userUid);

  let next: NotificationDoc[];
  if (!ids || ids.length === 0) {
    next = current.map((x) => ({ ...x, isRead: true }));
  } else {
    const set = new Set(ids.map(String));
    next = current.map((x) => (set.has(x.id) ? { ...x, isRead: true } : x));
  }

  await writeJson(notificationsKey(userUid), next);
}

export async function deleteNotification(userUid: string, id: string): Promise<boolean> {
  const current = await listNotifications(userUid);
  const next = current.filter((x) => x.id !== String(id));

  if (next.length === current.length) {
    return false;
  }

  await writeJson(notificationsKey(userUid), next);
  return true;
}

export async function clearNotifications(userUid: string): Promise<void> {
  await writeJson(notificationsKey(userUid), []);
}