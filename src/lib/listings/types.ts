export type ListingVisibility = 'public' | 'draft';

export interface ListingDoc {
  id: string;
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
  imageUrls: string[];
  visibility: ListingVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface ListingView extends ListingDoc {
  ownerProfile?: {
    uid: string;
    displayName: string;
    avatarUrl?: string;
  };
}