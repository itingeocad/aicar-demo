import { getRedis } from '@/lib/kv/upstash.server';
import { findUserById, getUsers, saveUsers } from '@/lib/auth/store.server';
import type { AIClipCommentDoc, AIClipDoc, AIClipView, ClipSourceType, ClipVisibility, UserProfileDoc } from './types';

function profileKey(uid: string) {
  return `aicar:profiles:${uid}`;
}

function clipKey(id: string) {
  return `aicar:clips:by-id:${id}`;
}

function clipsIndexKey() {
  return 'aicar:clips:index';
}

function userClipsKey(uid: string) {
  return `aicar:clips:user:${uid}`;
}

function clipLikesKey(id: string) {
  return `aicar:clips:likes:${id}`;
}

function clipFavoritesKey(id: string) {
  return `aicar:clips:favorites:${id}`;
}

function userFavoritesKey(uid: string) {
  return `aicar:clips:user-favorites:${uid}`;
}

function clipCommentsKey(id: string) {
  return `aicar:clips:comments:${id}`;
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

function sortNewestFirst<T extends { createdAt: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''));
}

async function readIdList(key: string): Promise<string[]> {
  return uniqueStrings(await readJson<string[]>(key, []));
}

export async function getProfileByUid(uid: string): Promise<UserProfileDoc | null> {
  if (!uid) return null;

  const existing = await readJson<UserProfileDoc | null>(profileKey(uid), null);
  if (existing?.uid) return existing;

  const user = await findUserById(uid);
  if (!user) return null;

  const doc: UserProfileDoc = {
    uid: user.id,
    email: user.email,
    displayName: user.displayName || user.email,
    bio: '',
    avatarUrl: '',
    coverUrl: '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  await writeJson(profileKey(uid), doc);
  return doc;
}

export async function updateProfile(
  uid: string,
  patch: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
  }
): Promise<UserProfileDoc | null> {
  const current = await getProfileByUid(uid);
  if (!current) return null;

  const now = new Date().toISOString();

  const next: UserProfileDoc = {
    ...current,
    displayName: String(patch.displayName ?? current.displayName).trim() || current.displayName,
    bio: String(patch.bio ?? current.bio ?? '').trim(),
    avatarUrl: String(patch.avatarUrl ?? current.avatarUrl ?? '').trim(),
    coverUrl: String(patch.coverUrl ?? current.coverUrl ?? '').trim(),
    updatedAt: now
  };

  await writeJson(profileKey(uid), next);

  const users = await getUsers();
  const changed = users.map((u) =>
    u.id === uid
      ? {
          ...u,
          displayName: next.displayName,
          updatedAt: now
        }
      : u
  );

  await saveUsers(changed);
  return next;
}

export async function getClipById(id: string): Promise<AIClipDoc | null> {
  return await readJson<AIClipDoc | null>(clipKey(id), null);
}

async function buildClipView(clip: AIClipDoc, viewerUid?: string | null): Promise<AIClipView> {
  const [ownerProfile, likes, favorites, comments] = await Promise.all([
    getProfileByUid(clip.ownerUid),
    readIdList(clipLikesKey(clip.id)),
    readIdList(clipFavoritesKey(clip.id)),
    readJson<AIClipCommentDoc[]>(clipCommentsKey(clip.id), [])
  ]);

  return {
    ...clip,
    ownerProfile: ownerProfile
      ? {
          uid: ownerProfile.uid,
          displayName: ownerProfile.displayName,
          avatarUrl: ownerProfile.avatarUrl
        }
      : undefined,
    likeCount: likes.length,
    commentCount: comments.length,
    favoriteCount: favorites.length,
    isLiked: Boolean(viewerUid && likes.includes(viewerUid)),
    isFavorited: Boolean(viewerUid && favorites.includes(viewerUid))
  };
}

export async function createClip(input: {
  ownerUid: string;
  ownerDisplayName: string;
  title: string;
  description?: string;
  videoUrl: string;
  posterUrl?: string;
  sourceType?: ClipSourceType;
  visibility?: ClipVisibility;
}): Promise<AIClipView> {
  const now = new Date().toISOString();

  const clip: AIClipDoc = {
    id: crypto.randomUUID(),
    ownerUid: input.ownerUid,
    ownerDisplayName: input.ownerDisplayName,
    title: String(input.title || '').trim(),
    description: String(input.description || '').trim(),
    videoUrl: String(input.videoUrl || '').trim(),
    posterUrl: String(input.posterUrl || '').trim(),
    sourceType: input.sourceType || 'url',
    visibility: input.visibility || 'public',
    createdAt: now,
    updatedAt: now
  };

  await writeJson(clipKey(clip.id), clip);

  const index = await readIdList(clipsIndexKey());
  await writeJson(clipsIndexKey(), [clip.id, ...index.filter((x) => x !== clip.id)]);

  const userIndex = await readIdList(userClipsKey(clip.ownerUid));
  await writeJson(userClipsKey(clip.ownerUid), [clip.id, ...userIndex.filter((x) => x !== clip.id)]);

  return await buildClipView(clip, clip.ownerUid);
}

async function loadClipsByIds(ids: string[], viewerUid?: string | null): Promise<AIClipView[]> {
  const clips = await Promise.all(ids.map((id) => getClipById(id)));
  const filtered = clips.filter(Boolean) as AIClipDoc[];
  const sorted = sortNewestFirst(filtered);
  return await Promise.all(sorted.map((clip) => buildClipView(clip, viewerUid)));
}

export async function listPublicClips(viewerUid?: string | null): Promise<AIClipView[]> {
  const ids = await readIdList(clipsIndexKey());
  const all = await loadClipsByIds(ids, viewerUid);
  return all.filter((clip) => clip.visibility === 'public');
}

export async function listUserClips(ownerUid: string, viewerUid?: string | null): Promise<AIClipView[]> {
  const ids = await readIdList(userClipsKey(ownerUid));
  return await loadClipsByIds(ids, viewerUid);
}

export async function listFavoriteClips(uid: string, viewerUid?: string | null): Promise<AIClipView[]> {
  const ids = await readIdList(userFavoritesKey(uid));
  return await loadClipsByIds(ids, viewerUid);
}

export async function likeClip(clipId: string, uid: string): Promise<AIClipView | null> {
  const clip = await getClipById(clipId);
  if (!clip) return null;

  const likes = await readIdList(clipLikesKey(clipId));
  if (!likes.includes(uid)) {
    likes.unshift(uid);
    await writeJson(clipLikesKey(clipId), uniqueStrings(likes));
  }

  return await buildClipView(clip, uid);
}

export async function unlikeClip(clipId: string, uid: string): Promise<AIClipView | null> {
  const clip = await getClipById(clipId);
  if (!clip) return null;

  const likes = await readIdList(clipLikesKey(clipId));
  await writeJson(
    clipLikesKey(clipId),
    likes.filter((x) => x !== uid)
  );

  return await buildClipView(clip, uid);
}

export async function favoriteClip(clipId: string, uid: string): Promise<AIClipView | null> {
  const clip = await getClipById(clipId);
  if (!clip) return null;

  const userFavs = await readIdList(userFavoritesKey(uid));
  const clipFavs = await readIdList(clipFavoritesKey(clipId));

  if (!userFavs.includes(clipId)) userFavs.unshift(clipId);
  if (!clipFavs.includes(uid)) clipFavs.unshift(uid);

  await writeJson(userFavoritesKey(uid), uniqueStrings(userFavs));
  await writeJson(clipFavoritesKey(clipId), uniqueStrings(clipFavs));

  return await buildClipView(clip, uid);
}

export async function unfavoriteClip(clipId: string, uid: string): Promise<AIClipView | null> {
  const clip = await getClipById(clipId);
  if (!clip) return null;

  const userFavs = await readIdList(userFavoritesKey(uid));
  const clipFavs = await readIdList(clipFavoritesKey(clipId));

  await writeJson(
    userFavoritesKey(uid),
    userFavs.filter((x) => x !== clipId)
  );

  await writeJson(
    clipFavoritesKey(clipId),
    clipFavs.filter((x) => x !== uid)
  );

  return await buildClipView(clip, uid);
}

export async function listComments(clipId: string): Promise<AIClipCommentDoc[]> {
  const items = await readJson<AIClipCommentDoc[]>(clipCommentsKey(clipId), []);
  return items.slice().sort((a, b) => Date.parse(a.createdAt || '') - Date.parse(b.createdAt || ''));
}

export async function addComment(input: {
  clipId: string;
  authorUid: string;
  authorDisplayName: string;
  text: string;
}): Promise<AIClipCommentDoc | null> {
  const clip = await getClipById(input.clipId);
  if (!clip) return null;

  const text = String(input.text || '').trim();
  if (!text) return null;

  const items = await listComments(input.clipId);

  const comment: AIClipCommentDoc = {
    id: crypto.randomUUID(),
    clipId: input.clipId,
    authorUid: input.authorUid,
    authorDisplayName: input.authorDisplayName,
    text,
    createdAt: new Date().toISOString()
  };

  items.push(comment);
  await writeJson(clipCommentsKey(input.clipId), items);
  return comment;
}