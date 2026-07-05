import type { User, UserRole } from '@/types/auth';
import type { ProduceCategory } from '@/types/category';
import type {
  BuyerDemand,
  BuyerDemandPayload,
  BuyerOnboardingData,
  BuyerProfile,
  BuyerProfileUpdate,
  BuyerRecommendation,
  MarketplaceListing,
} from '@/types/buyer';
import type { FarmerProfile, FarmerProfileUpdate, OnboardingData } from '@/types/farmer';
import type {
  ExtractionResult,
  Listing,
  ListingCreatePayload,
  ListingStatus,
  ListingUpdatePayload,
} from '@/types/listing';
import type { BuyerMatch } from '@/types/match';
import type { Notification, NotificationType } from '@/types/notification';
import type { CreateOfferPayload, Offer, OfferStatus } from '@/types/offer';
import type { Transaction, TransactionStatus } from '@/types/transaction';
import type { TransportSuggestion } from '@/types/transport';

/** Backend SafeUser shape returned by auth endpoints. */
export interface BackendSafeUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  role: string;
  accountStatus?: string;
  phoneVerified?: boolean;
  profileImageUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const DEFAULT_COORDS = { lat: 5.6037, lng: -0.187 };

function toIso(value: string | Date | null | undefined): string {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : value;
}

function toOptionalIso(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

export function mapBackendRole(role: string): UserRole {
  const normalized = role.toLowerCase();
  if (normalized === 'farmer' || normalized === 'buyer' || normalized === 'admin') {
    return normalized;
  }
  return 'farmer';
}

export function mapBackendUserToSessionUser(user: BackendSafeUser): User {
  const role = mapBackendRole(user.role);
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email ?? user.phoneNumber,
    phone: user.phoneNumber,
    role,
    roles: role === 'farmer' || role === 'buyer' ? [role] : undefined,
    avatarUrl: user.profileImageUrl ?? undefined,
    createdAt: toIso(user.createdAt),
    updatedAt: toIso(user.updatedAt),
  };
}

export function toBackendRole(role?: UserRole): 'FARMER' | 'BUYER' {
  return role === 'buyer' ? 'BUYER' : 'FARMER';
}

export function toBackendUnit(unit: string): string {
  const key = unit.toUpperCase().replace(/-/g, '_');
  const aliases: Record<string, string> = {
    DOZEN: 'PIECE',
    LITRE: 'PIECE',
    L: 'PIECE',
    BUSHEL: 'CRATE',
  };
  return aliases[key] ?? key;
}

export function fromBackendUnit(unit: string): string {
  return unit.toLowerCase();
}

function mapListingStatus(status: string): ListingStatus {
  switch (status.toUpperCase()) {
    case 'DRAFT':
      return 'draft';
    case 'PUBLISHED':
    case 'PARTIALLY_RESERVED':
    case 'RESERVED':
      return 'active';
    case 'SOLD':
      return 'sold';
    case 'EXPIRED':
      return 'expired';
    case 'CANCELLED':
      return 'archived';
    default:
      return 'draft';
  }
}

function mapOfferStatus(status: string): OfferStatus {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'pending';
    case 'ACCEPTED':
      return 'accepted';
    case 'REJECTED':
      return 'rejected';
    case 'CANCELLED':
      return 'cancelled';
    case 'EXPIRED':
      return 'expired';
    case 'COMPLETED':
      return 'completed';
    default:
      return 'pending';
  }
}

function mapTransactionStatus(status: string): TransactionStatus {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return 'pending_payment';
    case 'AWAITING_PICKUP':
      return 'payment_confirmed';
    case 'IN_TRANSIT':
      return 'in_transit';
    case 'DELIVERED':
      return 'delivered';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    case 'DISPUTED':
      return 'disputed';
    default:
      return 'pending_payment';
  }
}

function mapNotificationType(type: string): NotificationType {
  switch (type.toUpperCase()) {
    case 'MATCH_FOUND':
      return 'match_found';
    case 'OFFER_RECEIVED':
      return 'offer_received';
    case 'OFFER_ACCEPTED':
      return 'offer_accepted';
    case 'OFFER_REJECTED':
      return 'offer_rejected';
    case 'LISTING_EXPIRING':
      return 'listing_expiring';
    case 'TRANSPORT_POOL_FOUND':
      return 'pickup';
    case 'ACCOUNT_UPDATE':
      return 'account';
    case 'SYSTEM':
    default:
      return 'system';
  }
}

function mapMatchLabel(score: number): BuyerMatch['label'] {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'low';
}

function mapRecommendationStatus(status: string): BuyerRecommendation['status'] {
  switch (status.toUpperCase()) {
    case 'RECOMMENDED':
      return 'new';
    case 'VIEWED':
      return 'viewed';
    case 'OFFERED':
      return 'offer_sent';
    case 'CONVERTED':
      return 'converted';
    case 'EXPIRED':
      return 'expired';
    default:
      return 'new';
  }
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent match';
  if (score >= 60) return 'Good match';
  if (score >= 40) return 'Fair match';
  return 'Low match';
}

function resolveCoords(
  gps?: { lat: number; lng: number },
): { latitude: number; longitude: number } {
  if (gps && typeof gps.lat === 'number' && typeof gps.lng === 'number') {
    return { latitude: gps.lat, longitude: gps.lng };
  }
  return { latitude: DEFAULT_COORDS.lat, longitude: DEFAULT_COORDS.lng };
}

// ----- Listings -----

export function mapBackendListing(raw: Record<string, unknown>): Listing {
  const category = raw.category as { id?: string; name?: string } | undefined;
  const farmer = raw.farmer as { id?: string } | undefined;
  const confidence = raw.aiExtractionConfidence as number | null | undefined;

  return {
    id: String(raw.id),
    farmerId: String(farmer?.id ?? raw.farmerId ?? ''),
    title: String(raw.title ?? ''),
    categoryId: String(raw.categoryId ?? category?.id ?? ''),
    categoryName: category?.name,
    produceType: category?.name ?? String(raw.title ?? ''),
    quantity: Number(raw.quantity ?? 0),
    unit: fromBackendUnit(String(raw.unit ?? 'KG')),
    pricePerUnit: Number(raw.pricePerUnit ?? 0),
    currency: String(raw.currency ?? 'GHS'),
    description: raw.description ? String(raw.description) : undefined,
    images: Array.isArray(raw.imageUrls)
      ? (raw.imageUrls as string[])
      : Array.isArray(raw.images)
        ? (raw.images as string[])
        : [],
    harvestDate: toOptionalIso(raw.harvestDate as string | Date | undefined),
    availableFrom: toIso(raw.availableFrom as string | Date | undefined),
    availableUntil: toOptionalIso(raw.availableUntil as string | Date | undefined),
    region: String(raw.region ?? ''),
    district: String(raw.district ?? ''),
    status: mapListingStatus(String(raw.status ?? 'DRAFT')),
    aiConfidence:
      confidence == null
        ? undefined
        : confidence >= 0.8
          ? 'high'
          : confidence >= 0.5
            ? 'medium'
            : 'low',
    createdAt: toIso(raw.createdAt as string | Date | undefined),
    updatedAt: toIso(raw.updatedAt as string | Date | undefined),
  };
}

export function mapBackendListingToMarketplace(raw: Record<string, unknown>): MarketplaceListing {
  const listing = mapBackendListing(raw);
  const farmer = raw.farmer as
    | { farmName?: string; verificationStatus?: string }
    | undefined;

  const farmerName =
    (raw.farmerName as string | undefined) ??
    farmer?.farmName ??
    listing.farmerId;

  return {
    ...listing,
    farmerName: String(farmerName),
    farmName: farmer?.farmName,
    farmerVerified: farmer?.verificationStatus === 'VERIFIED',
    availableQuantity:
      raw.availableQuantity != null ? Number(raw.availableQuantity) : listing.quantity,
    minimumOrder:
      raw.minimumOrderQuantity != null ? Number(raw.minimumOrderQuantity) : undefined,
    town: raw.town ? String(raw.town) : undefined,
    distanceKm: raw.distanceKm != null ? Number(raw.distanceKm) : undefined,
    matchScore: raw.matchScore != null ? Number(raw.matchScore) : undefined,
    qualityGrade: raw.qualityGrade ? String(raw.qualityGrade) : undefined,
    farmingMethod: raw.farmingMethod ? String(raw.farmingMethod) : undefined,
  };
}

export function toBackendListingCreatePayload(
  payload: ListingCreatePayload,
  profile: FarmerProfile,
): Record<string, unknown> {
  const coords = resolveCoords(profile.gpsCoordinates);
  return {
    categoryId: payload.categoryId,
    title: payload.title,
    description: payload.description?.trim() || payload.produceType || payload.title,
    quantity: payload.quantity,
    unit: toBackendUnit(payload.unit),
    pricePerUnit: payload.pricePerUnit,
    currency: 'GHS',
    harvestDate: payload.harvestDate,
    availableFrom: payload.availableFrom,
    availableUntil: payload.availableUntil,
    region: payload.region || profile.region,
    district: payload.district || profile.district,
    town: profile.village ?? profile.district,
    latitude: coords.latitude,
    longitude: coords.longitude,
    imageUrls: payload.images ?? [],
  };
}

export function toBackendListingUpdatePayload(
  payload: ListingUpdatePayload,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.categoryId) body.categoryId = payload.categoryId;
  if (payload.title) body.title = payload.title;
  if (payload.description) body.description = payload.description;
  if (payload.quantity != null) body.quantity = payload.quantity;
  if (payload.unit) body.unit = toBackendUnit(payload.unit);
  if (payload.pricePerUnit != null) body.pricePerUnit = payload.pricePerUnit;
  if (payload.harvestDate) body.harvestDate = payload.harvestDate;
  if (payload.availableFrom) body.availableFrom = payload.availableFrom;
  if (payload.availableUntil) body.availableUntil = payload.availableUntil;
  if (payload.region) body.region = payload.region;
  if (payload.district) body.district = payload.district;
  if (payload.images) body.imageUrls = payload.images;
  return body;
}

export function mapBackendExtraction(raw: Record<string, unknown>): ExtractionResult {
  const confidence = Number(raw.confidence ?? raw.aiExtractionConfidence ?? 0.5);
  return {
    title: raw.title ? String(raw.title) : undefined,
    categoryId: raw.categoryId ? String(raw.categoryId) : undefined,
    produceType: raw.produceType ? String(raw.produceType) : raw.categoryName ? String(raw.categoryName) : undefined,
    quantity: raw.quantity != null ? Number(raw.quantity) : undefined,
    unit: raw.unit ? fromBackendUnit(String(raw.unit)) : undefined,
    pricePerUnit: raw.pricePerUnit != null ? Number(raw.pricePerUnit) : undefined,
    description: raw.description ? String(raw.description) : undefined,
    harvestDate: toOptionalIso(raw.harvestDate as string | Date | undefined),
    confidence: confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
    rawText: raw.rawText ? String(raw.rawText) : undefined,
  };
}

// ----- Offers & transactions -----

export function mapBackendOffer(raw: Record<string, unknown>): Offer {
  const listing = raw.listing as { id?: string } | undefined;
  const buyer = raw.buyer as { id?: string; businessName?: string } | undefined;

  return {
    id: String(raw.id),
    listingId: String(raw.listingId ?? listing?.id ?? ''),
    buyerId: String(raw.buyerId ?? buyer?.id ?? ''),
    buyerName: buyer?.businessName,
    quantity: Number(raw.offeredQuantity ?? raw.quantity ?? 0),
    unit: fromBackendUnit(String(raw.unit ?? 'KG')),
    pricePerUnit: Number(raw.offeredPricePerUnit ?? raw.pricePerUnit ?? 0),
    totalAmount: Number(raw.totalAmount ?? 0),
    currency: String(raw.currency ?? 'GHS'),
    message: raw.message ? String(raw.message) : undefined,
    status: mapOfferStatus(String(raw.status ?? 'PENDING')),
    expiresAt: toOptionalIso(raw.expiresAt as string | Date | undefined),
    createdAt: toIso(raw.createdAt as string | Date | undefined),
    updatedAt: toIso(raw.updatedAt as string | Date | undefined),
  };
}

export function mapBackendTransaction(raw: Record<string, unknown>): Transaction {
  const listing = raw.listing as { id?: string; title?: string } | undefined;

  return {
    id: String(raw.id),
    offerId: String(raw.offerId ?? ''),
    listingId: String(raw.listingId ?? listing?.id ?? ''),
    farmerId: String(raw.farmerId ?? ''),
    buyerId: String(raw.buyerId ?? ''),
    listingTitle: listing?.title,
    quantity: Number(raw.agreedQuantity ?? raw.quantity ?? 0),
    unit: fromBackendUnit(String(raw.unit ?? 'KG')),
    pricePerUnit: Number(raw.agreedPricePerUnit ?? raw.pricePerUnit ?? 0),
    totalAmount: Number(raw.totalAmount ?? 0),
    currency: String(raw.currency ?? 'GHS'),
    status: mapTransactionStatus(String(raw.status ?? 'CONFIRMED')),
    deliveryDate: toOptionalIso(raw.pickupDate as string | Date | undefined),
    createdAt: toIso(raw.createdAt as string | Date | undefined),
    updatedAt: toIso(raw.updatedAt as string | Date | undefined),
  };
}

export function toBackendCreateOfferPayload(payload: CreateOfferPayload): Record<string, unknown> {
  const pickup =
    payload.proposedPickupDate ??
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return {
    listingId: payload.listingId,
    offeredQuantity: payload.quantity,
    offeredPricePerUnit: payload.pricePerUnit,
    message: payload.message,
    proposedPickupDate: pickup,
  };
}

// ----- Profiles -----

export function mapBackendFarmerProfile(raw: Record<string, unknown>): FarmerProfile {
  const lat = raw.latitude as number | undefined;
  const lng = raw.longitude as number | undefined;

  return {
    id: String(raw.id),
    userId: String(raw.userId),
    farmName: String(raw.farmName ?? ''),
    region: String(raw.region ?? ''),
    district: String(raw.district ?? ''),
    village: raw.town ? String(raw.town) : undefined,
    gpsCoordinates:
      typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : undefined,
    farmSizeAcres: raw.farmSizeAcres != null ? Number(raw.farmSizeAcres) : undefined,
    primaryCrops: Array.isArray(raw.primaryCrops) ? (raw.primaryCrops as string[]) : [],
    bio: raw.description ? String(raw.description) : undefined,
    onboardingComplete: true,
    createdAt: toIso(raw.createdAt as string | Date | undefined),
    updatedAt: toIso(raw.updatedAt as string | Date | undefined),
  };
}

export function toBackendFarmerProfilePayload(
  data: OnboardingData | FarmerProfileUpdate,
): Record<string, unknown> {
  const coords = resolveCoords(data.gpsCoordinates);
  const body: Record<string, unknown> = {};

  if ('farmName' in data && data.farmName) body.farmName = data.farmName;
  if (data.region) body.region = data.region;
  if (data.district) body.district = data.district;
  if (data.village || data.district) body.town = data.village ?? data.district;
  body.latitude = coords.latitude;
  body.longitude = coords.longitude;
  if (data.primaryCrops) body.primaryCrops = data.primaryCrops;
  if (data.farmSizeAcres != null) body.farmSizeAcres = data.farmSizeAcres;
  if (data.bio) body.description = data.bio;

  return body;
}

export function mapBackendBuyerProfile(raw: Record<string, unknown>): BuyerProfile {
  const lat = raw.latitude as number | undefined;
  const lng = raw.longitude as number | undefined;
  const buyerType = String(raw.buyerType ?? 'OTHER').toLowerCase();

  return {
    id: String(raw.id),
    userId: String(raw.userId),
    businessName: String(raw.businessName ?? ''),
    buyerType: buyerType as BuyerProfile['buyerType'],
    description: raw.description ? String(raw.description) : undefined,
    region: String(raw.region ?? ''),
    district: String(raw.district ?? ''),
    town: String(raw.town ?? ''),
    gpsCoordinates:
      typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : undefined,
    maxTravelDistanceKm:
      raw.maximumTravelDistanceKm != null ? Number(raw.maximumTravelDistanceKm) : undefined,
    preferredProduce: Array.isArray(raw.preferredProduce)
      ? (raw.preferredProduce as string[])
      : [],
    commonUnits: [],
    typicalQuantityMin:
      raw.minimumOrderQuantity != null ? Number(raw.minimumOrderQuantity) : undefined,
    onboardingComplete: true,
    verificationStatus:
      raw.verificationStatus === 'VERIFIED'
        ? 'verified'
        : raw.verificationStatus === 'PENDING'
          ? 'pending'
          : 'unverified',
    createdAt: toIso(raw.createdAt as string | Date | undefined),
    updatedAt: toIso(raw.updatedAt as string | Date | undefined),
  };
}

export function toBackendBuyerProfilePayload(
  data: BuyerOnboardingData | BuyerProfileUpdate,
): Record<string, unknown> {
  const coords = resolveCoords(data.gpsCoordinates);
  const body: Record<string, unknown> = {};

  if ('businessName' in data && data.businessName) body.businessName = data.businessName;
  if (data.buyerType) body.buyerType = data.buyerType.toUpperCase();
  if (data.description) body.description = data.description;
  if (data.region) body.region = data.region;
  if (data.district) body.district = data.district;
  if (data.town) body.town = data.town;
  body.latitude = coords.latitude;
  body.longitude = coords.longitude;
  if (data.preferredProduce) body.preferredProduce = data.preferredProduce;
  if (data.maxTravelDistanceKm != null) body.maximumTravelDistanceKm = data.maxTravelDistanceKm;
  if (data.typicalQuantityMin != null) body.minimumOrderQuantity = data.typicalQuantityMin;

  return body;
}

// ----- Demands -----

export function mapBackendDemand(raw: Record<string, unknown>): BuyerDemand {
  const category = raw.category as { id?: string; name?: string } | undefined;
  const isActive = raw.isActive !== false;

  return {
    id: String(raw.id),
    buyerId: String(raw.buyerId ?? ''),
    produceCategory: String(category?.name ?? raw.produceCategory ?? ''),
    produceCategoryId: String(raw.categoryId ?? category?.id ?? ''),
    quantityMin: Number(raw.minimumQuantity ?? raw.quantityMin ?? 0),
    quantityMax: Number(raw.maximumQuantity ?? raw.quantityMax ?? raw.minimumQuantity ?? 0),
    unit: fromBackendUnit(String(raw.unit ?? 'KG')),
    preferredMaxPrice:
      raw.preferredPriceMaximum != null ? Number(raw.preferredPriceMaximum) : undefined,
    currency: 'GHS',
    requiredFrom: toIso(raw.requiredFrom as string | Date | undefined),
    requiredUntil: toOptionalIso(raw.requiredUntil as string | Date | undefined),
    preferredRegions: Array.isArray(raw.preferredRegions)
      ? (raw.preferredRegions as string[])
      : [],
    isRecurring: Boolean(raw.isRecurring),
    frequency: raw.frequency ? (String(raw.frequency) as BuyerDemand['frequency']) : undefined,
    status: isActive ? 'active' : 'inactive',
    createdAt: toIso(raw.createdAt as string | Date | undefined),
    updatedAt: toIso(raw.updatedAt as string | Date | undefined),
  };
}

export function toBackendDemandPayload(
  payload: BuyerDemandPayload,
  categoryId: string,
): Record<string, unknown> {
  return {
    categoryId,
    minimumQuantity: payload.quantityMin,
    maximumQuantity: payload.quantityMax,
    unit: toBackendUnit(payload.unit),
    preferredPriceMaximum: payload.preferredMaxPrice,
    requiredFrom: payload.requiredFrom,
    requiredUntil: payload.requiredUntil,
    preferredRegions: payload.preferredRegions,
    isRecurring: payload.isRecurring,
    frequency: payload.frequency,
    isActive: payload.status !== 'inactive',
  };
}

export async function resolveCategoryId(
  payload: BuyerDemandPayload,
  fetchCategories: () => Promise<ProduceCategory[]>,
): Promise<string> {
  if (payload.produceCategoryId) return payload.produceCategoryId;

  const categories = await fetchCategories();
  const needle = payload.produceCategory.trim().toLowerCase();
  const match =
    categories.find((c) => c.name.toLowerCase() === needle) ??
    categories.find((c) => c.slug.toLowerCase() === needle) ??
    categories.find((c) => c.name.toLowerCase().includes(needle));

  if (!match) {
    throw new Error(`Unknown produce category: ${payload.produceCategory}`);
  }
  return match.id;
}

// ----- Recommendations & matches -----

export function mapBackendRecommendation(raw: Record<string, unknown>): BuyerRecommendation {
  const listing = (raw.listing ?? {}) as Record<string, unknown>;
  const farmer = (listing.farmer ?? {}) as Record<string, unknown>;
  const category = (listing.category ?? {}) as Record<string, unknown>;
  const score = Number(raw.score ?? 0);

  return {
    id: String(raw.id),
    demandId: raw.demandId ? String(raw.demandId) : undefined,
    listingId: String(raw.listingId ?? listing.id ?? ''),
    listingTitle: String(listing.title ?? ''),
    produceType: String(category.name ?? listing.title ?? ''),
    farmerId: String(farmer.id ?? listing.farmerId ?? ''),
    farmerName: String(farmer.farmName ?? 'Farmer'),
    farmName: farmer.farmName ? String(farmer.farmName) : undefined,
    farmerVerified: farmer.verificationStatus === 'VERIFIED',
    quantity: Number(listing.availableQuantity ?? listing.quantity ?? 0),
    unit: fromBackendUnit(String(listing.unit ?? 'KG')),
    pricePerUnit: Number(listing.pricePerUnit ?? 0),
    currency: String(listing.currency ?? 'GHS'),
    region: String(listing.region ?? farmer.region ?? ''),
    district: String(listing.district ?? farmer.district ?? ''),
    town: listing.town ? String(listing.town) : farmer.town ? String(farmer.town) : undefined,
    distanceKm: raw.distanceKm != null ? Number(raw.distanceKm) : 0,
    harvestDate: toOptionalIso(listing.harvestDate as string | Date | undefined),
    availableFrom: toIso(listing.availableFrom as string | Date | undefined),
    availableUntil: toOptionalIso(listing.availableUntil as string | Date | undefined),
    score,
    scoreLabel: scoreLabel(score),
    scoreBreakdown: {
      produce: Number(raw.produceScore ?? 0),
      quantity: Number(raw.quantityScore ?? 0),
      distance: Number(raw.distanceScore ?? 0),
      date: Number(raw.dateScore ?? 0),
      price: Number(raw.priceScore ?? 0),
      total: score,
    },
    explanation: String(raw.explanation ?? ''),
    status: mapRecommendationStatus(String(raw.status ?? 'RECOMMENDED')),
    createdAt: toIso(raw.generatedAt as string | Date | undefined),
  };
}

export function mapBackendListingMatch(raw: Record<string, unknown>): BuyerMatch {
  const buyer = (raw.buyer ?? {}) as Record<string, unknown>;

  return {
    id: String(raw.id),
    buyerId: String(raw.buyerId ?? buyer.id ?? ''),
    buyerName: String(buyer.businessName ?? 'Buyer'),
    listingId: String(raw.listingId ?? ''),
    score: Number(raw.score ?? 0),
    label: mapMatchLabel(Number(raw.score ?? 0)),
    region: buyer.region ? String(buyer.region) : undefined,
    createdAt: toIso(raw.generatedAt as string | Date | undefined),
  };
}

// ----- Categories & notifications -----

export function mapBackendCategory(raw: Record<string, unknown>): ProduceCategory {
  return {
    id: String(raw.id),
    name: String(raw.name),
    slug: String(raw.slug),
    commonUnits: Array.isArray(raw.unitOptions)
      ? (raw.unitOptions as string[]).map(fromBackendUnit)
      : [],
    active: raw.isActive !== false,
  };
}

export function mapBackendNotification(raw: Record<string, unknown>): Notification {
  const metadata = raw.metadata as Record<string, unknown> | null | undefined;

  return {
    id: String(raw.id),
    userId: String(raw.userId),
    type: mapNotificationType(String(raw.type ?? 'SYSTEM')),
    title: String(raw.title ?? ''),
    body: String(raw.message ?? raw.body ?? ''),
    read: raw.readAt != null,
    actionUrl: metadata?.actionUrl ? String(metadata.actionUrl) : undefined,
    metadata: metadata ?? undefined,
    createdAt: toIso(raw.createdAt as string | Date | undefined),
  };
}

// ----- Transport pool suggestions -----

export function mapBackendTransportSuggestion(raw: Record<string, unknown>): TransportSuggestion {
  const primary = (raw.primaryListing ?? {}) as Record<string, unknown>;
  const secondary = (raw.secondaryListing ?? {}) as Record<string, unknown>;
  const savings = raw.estimatedSavingsPercentage as number | null | undefined;

  return {
    id: String(raw.id),
    transactionId: primary.id ? String(primary.id) : undefined,
    transporterName: secondary.title ? `Pool with ${String(secondary.title)}` : 'Transport pool',
    transporterPhone: '',
    vehicleType: 'Shared transport pool',
    estimatedCost: savings != null ? Math.max(0, 100 - savings) : 0,
    currency: 'GHS',
    distanceKm: Number(raw.distanceBetweenFarmsKm ?? 0),
    notes: String(raw.explanation ?? ''),
  };
}
