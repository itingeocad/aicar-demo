import { getRedis } from '@/lib/kv/upstash.server';
import { getClipById, getProfileByUid } from '@/lib/aiclips/store.server';
import { getListingById } from '@/lib/listings/store.server';
import { createNotification } from '@/lib/notifications/store.server';
import type { AIClipCommentDoc } from '@/lib/aiclips/types';
import type {
  CommentDoc,
  CommentTargetType,
  CommentTreeDoc,
  CommentsSettingsDoc,
  TargetCommentsPolicyDoc
} from './types';

function commentsIndexKey(targetType: CommentTargetType, targetId: string) {
  return `aicar:comments:${targetType}:${targetId}`;
}

function commentByIdKey(id: string) {
  return `aicar:comments:by-id:${id}`;
}

function commentsSettingsKey() {
  return 'aicar:comments:settings';
}

function targetPolicyKey(targetType: CommentTargetType, targetId: string) {
  return `aicar:comments:policy:${targetType}:${targetId}`;
}

function legacyClipCommentsKey(clipId: string) {
  return `aicar:clips:comments:${clipId}`;
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

async function getTargetOwner(targetType: CommentTargetType, targetId: string): Promise<{ ownerUid: string | null; exists: boolean }> {
  if (targetType === 'clip') {
    const clip = await getClipById(targetId);
    return { ownerUid: clip?.ownerUid || null, exists: Boolean(clip) };
  }

  const listing = await getListingById(targetId);
  return { ownerUid: listing?.ownerUid || null, exists: Boolean(listing) };
}

export async function getCommentsSettings(): Promise<CommentsSettingsDoc> {
  return await readJson<CommentsSettingsDoc>(commentsSettingsKey(), {
    clipsEnabled: true,
    listingsEnabled: true,
    updatedAt: new Date(0).toISOString()
  });
}

export async function updateCommentsSettings(patch: {
  clipsEnabled?: boolean;
  listingsEnabled?: boolean;
}): Promise<CommentsSettingsDoc> {
  const current = await getCommentsSettings();

  const next: CommentsSettingsDoc = {
    clipsEnabled: typeof patch.clipsEnabled === 'boolean' ? patch.clipsEnabled : current.clipsEnabled,
    listingsEnabled: typeof patch.listingsEnabled === 'boolean' ? patch.listingsEnabled : current.listingsEnabled,
    updatedAt: new Date().toISOString()
  };

  await writeJson(commentsSettingsKey(), next);
  return next;
}

export async function getTargetCommentsPolicy(
  targetType: CommentTargetType,
  targetId: string
): Promise<TargetCommentsPolicyDoc> {
  return await readJson<TargetCommentsPolicyDoc>(targetPolicyKey(targetType, targetId), {
    targetType,
    targetId,
    enabled: true,
    disabledBy: null,
    updatedAt: new Date(0).toISOString()
  });
}

export async function setTargetCommentsPolicy(input: {
  targetType: CommentTargetType;
  targetId: string;
  enabled: boolean;
  disabledBy: 'owner' | 'admin';
}): Promise<TargetCommentsPolicyDoc | null> {
  const target = await getTargetOwner(input.targetType, input.targetId);
  if (!target.exists) return null;

  const next: TargetCommentsPolicyDoc = {
    targetType: input.targetType,
    targetId: input.targetId,
    enabled: Boolean(input.enabled),
    disabledBy: input.enabled ? null : input.disabledBy,
    updatedAt: new Date().toISOString()
  };

  await writeJson(targetPolicyKey(input.targetType, input.targetId), next);
  return next;
}

export async function getEffectiveCommentsState(targetType: CommentTargetType, targetId: string) {
  const [settings, policy, target] = await Promise.all([
    getCommentsSettings(),
    getTargetCommentsPolicy(targetType, targetId),
    getTargetOwner(targetType, targetId)
  ]);

  if (!target.exists) {
    return {
      exists: false,
      enabled: false,
      ownerUid: null,
      reason: 'not_found' as const
    };
  }

  if (targetType === 'clip' && !settings.clipsEnabled) {
    return {
      exists: true,
      enabled: false,
      ownerUid: target.ownerUid,
      reason: 'clips_globally_disabled' as const
    };
  }

  if (targetType === 'listing' && !settings.listingsEnabled) {
    return {
      exists: true,
      enabled: false,
      ownerUid: target.ownerUid,
      reason: 'listings_globally_disabled' as const
    };
  }

  if (!policy.enabled) {
    return {
      exists: true,
      enabled: false,
      ownerUid: target.ownerUid,
      reason: 'target_comments_disabled' as const
    };
  }

  return {
    exists: true,
    enabled: true,
    ownerUid: target.ownerUid,
    reason: null
  };
}

async function listFlatComments(targetType: CommentTargetType, targetId: string): Promise<CommentDoc[]> {
  const items = await readJson<CommentDoc[]>(commentsIndexKey(targetType, targetId), []);
  const sorted = items.slice().sort((a, b) => Date.parse(a.createdAt || '') - Date.parse(b.createdAt || ''));
  const hydrated = await Promise.all(
    sorted.map(async (comment) => {
      const profile = await getProfileByUid(comment.authorUid);

      return {
        ...comment,
        authorDisplayName: profile?.displayName || comment.authorDisplayName
      };
    })
  );

  return hydrated;
}

async function syncLegacyClipComments(clipId: string, comments: CommentDoc[]): Promise<void> {
  const topLevel = comments
    .filter((x) => !x.parentId)
    .map<AIClipCommentDoc>((x) => ({
      id: x.id,
      clipId,
      authorUid: x.authorUid,
      authorDisplayName: x.authorDisplayName,
      text: x.text,
      createdAt: x.createdAt
    }));

  await writeJson(legacyClipCommentsKey(clipId), topLevel);
}

export async function listCommentsTree(targetType: CommentTargetType, targetId: string): Promise<CommentTreeDoc[]> {
  const items = await listFlatComments(targetType, targetId);

  const nodes = new Map<string, CommentTreeDoc>();
  for (const item of items) {
    nodes.set(item.id, { ...item, replies: [] });
  }

  const roots: CommentTreeDoc[] = [];
  for (const item of items) {
    const node = nodes.get(item.id)!;
    if (item.parentId && nodes.has(item.parentId)) {
      nodes.get(item.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function addComment(input: {
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string | null;
  authorUid: string;
  authorDisplayName: string;
  text: string;
}): Promise<{ comment?: CommentDoc; error?: string }> {
  const targetState = await getEffectiveCommentsState(input.targetType, input.targetId);
  if (!targetState.exists) return { error: 'not_found' };
  if (!targetState.enabled) return { error: targetState.reason || 'comments_disabled' };

  const text = String(input.text || '').trim();
  if (!text) return { error: 'text_required' };

  let parent: CommentDoc | null = null;
  if (input.parentId) {
    parent = await readJson<CommentDoc | null>(commentByIdKey(String(input.parentId)), null);
    if (!parent) return { error: 'parent_not_found' };
    if (parent.targetType !== input.targetType || parent.targetId !== input.targetId) {
      return { error: 'parent_target_mismatch' };
    }
  }

  const authorProfile = await getProfileByUid(input.authorUid);
  const now = new Date().toISOString();

  const comment: CommentDoc = {
    id: crypto.randomUUID(),
    targetType: input.targetType,
    targetId: input.targetId,
    parentId: input.parentId ? String(input.parentId) : null,
    authorUid: input.authorUid,
    authorDisplayName: authorProfile?.displayName || input.authorDisplayName,
    text,
    createdAt: now,
    updatedAt: now
  };

  const flat = await listFlatComments(input.targetType, input.targetId);
  flat.push(comment);

  await writeJson(commentsIndexKey(input.targetType, input.targetId), flat);
  await writeJson(commentByIdKey(comment.id), comment);

  if (input.targetType === 'clip') {
    await syncLegacyClipComments(input.targetId, flat);
  }

  const ownerUid = targetState.ownerUid;
  if (ownerUid && ownerUid !== input.authorUid) {
    await createNotification({
      userUid: ownerUid,
      type: input.targetType === 'clip' ? 'clip_comment' : 'listing_comment',
      targetType: input.targetType,
      targetId: input.targetId,
      commentId: comment.id,
      actorUid: input.authorUid,
      actorDisplayName: comment.authorDisplayName,
      textSnippet: text
    });
  }

  if (parent && parent.authorUid !== input.authorUid) {
    await createNotification({
      userUid: parent.authorUid,
      type: 'comment_reply',
      targetType: input.targetType,
      targetId: input.targetId,
      commentId: comment.id,
      actorUid: input.authorUid,
      actorDisplayName: comment.authorDisplayName,
      textSnippet: text
    });
  }

  return { comment };
}