export type CommentTargetType = 'clip' | 'listing';
export type CommentNotificationType = 'comment_reply' | 'clip_comment' | 'listing_comment';
export type CommentsDisabledBy = 'owner' | 'admin' | null;

export interface CommentDoc {
  id: string;
  targetType: CommentTargetType;
  targetId: string;
  parentId: string | null;
  authorUid: string;
  authorDisplayName: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface CommentTreeDoc extends CommentDoc {
  replies: CommentTreeDoc[];
}

export interface CommentsSettingsDoc {
  clipsEnabled: boolean;
  listingsEnabled: boolean;
  updatedAt: string;
}

export interface TargetCommentsPolicyDoc {
  targetType: CommentTargetType;
  targetId: string;
  enabled: boolean;
  disabledBy: CommentsDisabledBy;
  updatedAt: string;
}