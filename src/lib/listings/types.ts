export type ListingVisibility = 'public' | 'draft';

export type ListingModerationStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'unpublished';

export type ListingType = 'in_stock' | 'in_transit' | 'on_order';

export type VehicleCategory =
  | 'car'
  | 'suv'
  | 'truck'
  | 'motorcycle';

export type VehicleDrivetrain =
  | 'fwd'
  | 'rwd'
  | 'awd'
  | '4wd';

export type VehicleFuelType =
  | 'petrol'
  | 'diesel'
  | 'hybrid'
  | 'plugin_hybrid'
  | 'electric'
  | 'lpg';

export type VehicleTransmission =
  | 'manual'
  | 'automatic'
  | 'cvt'
  | 'robot';

export type PriceCurrency = 'EUR' | 'USD' | 'MDL';

export type VehicleOption = {
  id: string;
  label: string;
};

export type VehicleModelOption = VehicleOption & {
  brandId: string;
};

export type ListingCatalog = {
  listingTypes: VehicleOption[];
  vehicleCategories: VehicleOption[];
  drivetrains: VehicleOption[];
  fuelTypes: VehicleOption[];
  transmissions: VehicleOption[];
  engines: VehicleOption[];
  regions: VehicleOption[];
  currencies: VehicleOption[];
  brands: VehicleOption[];
  models: VehicleModelOption[];
};

export type ListingOwnerProfile = {
  uid: string;
  displayName: string;
  avatarUrl?: string;
};

export type ListingDoc = {
  id: string;
  ownerUid: string;
  ownerDisplayName?: string;
  ownerAvatarUrl?: string;

  title: string;
  description: string;

  price: number | null;
  currency: string;
  city: string;

  brand: string;
  model: string;
  year: number | null;
  coverUrl?: string;
  imageUrls: string[];

  visibility: ListingVisibility;

  commentsEnabled?: boolean;
  commentCount?: number;

  createdAt: string;
  updatedAt: string;

  listingType?: ListingType;
  vehicleCategory?: VehicleCategory;

  brandId?: string;
  modelId?: string;

  mileageKm?: number | null;
  drivetrain?: VehicleDrivetrain | '';
  fuelType?: VehicleFuelType | '';
  transmission?: VehicleTransmission | '';
  engine?: string;
  regionId?: string;

  priceAmount?: number | null;
  priceCurrency?: PriceCurrency;

  linkedClipIds?: string[];

  moderationStatus?: ListingModerationStatus;
  publishedAt?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedAt?: string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
};

export type ListingView = ListingDoc & {
  ownerProfile?: ListingOwnerProfile;
  isOwner?: boolean;
};

export type CreateListingInput = {
  title: string;
  description?: string;

  price?: number | null;
  currency?: string;
  city?: string;

  brand?: string;
  model?: string;
  year?: number | null;
  coverUrl?: string;
  imageUrls?: string[];
  visibility?: ListingVisibility;
  commentsEnabled?: boolean;

  listingType?: ListingType;
  vehicleCategory?: VehicleCategory;

  brandId?: string;
  modelId?: string;

  mileageKm?: number | null;
  drivetrain?: VehicleDrivetrain | '';
  fuelType?: VehicleFuelType | '';
  transmission?: VehicleTransmission | '';
  engine?: string;
  regionId?: string;

  priceAmount?: number | null;
  priceCurrency?: PriceCurrency;

  linkedClipIds?: string[];
  moderationStatus?: ListingModerationStatus;
};

export type UpdateListingInput = Partial<CreateListingInput> & {
  id?: string;
};