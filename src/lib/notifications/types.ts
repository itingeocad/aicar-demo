import type { CommentNotificationType, CommentTargetType } from '@/lib/comments/types';

export interface NotificationDoc {
  id: string;
  userUid: string;
  type: CommentNotificationType;
  targetType: CommentTargetType;
  targetId: string;
  commentId: string;
  actorUid: string;
  actorDisplayName: string;
  actorAvatarUrl?: string;
  textSnippet?: string;
  isRead: boolean;
  createdAt: string;
}