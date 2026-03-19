export type ClipVisibility = 'public' | 'draft';
export type ClipSourceType = 'upload' | 'url';

export interface UserProfileDoc {
  uid: string;
  email: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIClipDoc {
  id: string;
  ownerUid: string;
  ownerDisplayName: string;
  title: string;
  description?: string;
  videoUrl: string;
  posterUrl?: string;
  sourceType: ClipSourceType;
  visibility: ClipVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface AIClipCommentDoc {
  id: string;
  clipId: string;
  authorUid: string;
  authorDisplayName: string;
  text: string;
  createdAt: string;
}

export interface AIClipView extends AIClipDoc {
  ownerProfile?: Pick<UserProfileDoc, 'uid' | 'displayName' | 'avatarUrl'>;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  isLiked: boolean;
  isFavorited: boolean;
}