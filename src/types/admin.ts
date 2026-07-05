import type { PaginationMeta } from '@/types/api';

export type AdminAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
export type AdminVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AdminUserRole = 'FARMER' | 'BUYER' | 'ADMIN';

export type AdminListingStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'PARTIALLY_RESERVED'
  | 'RESERVED'
  | 'SOLD'
  | 'EXPIRED'
  | 'CANCELLED';

export type AdminOfferStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'COMPLETED';

export type AdminTransactionStatus =
  | 'CONFIRMED'
  | 'AWAITING_PICKUP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type AdminMatchStatus =
  | 'RECOMMENDED'
  | 'VIEWED'
  | 'DISMISSED'
  | 'OFFERED'
  | 'CONVERTED'
  | 'EXPIRED';

export type AdminTransportStatus = 'SUGGESTED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export interface AdminUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  role: AdminUserRole;
  accountStatus: AdminAccountStatus;
  phoneVerified: boolean;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  farmerProfile?: AdminFarmerProfile | null;
  buyerProfile?: AdminBuyerProfile | null;
}

export interface AdminFarmerProfile {
  id: string;
  userId: string;
  farmName: string;
  description: string | null;
  region: string;
  district: string;
  town: string;
  latitude: number;
  longitude: number;
  primaryCrops: string[];
  farmSizeAcres: number | null;
  verificationStatus: AdminVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBuyerProfile {
  id: string;
  userId: string;
  businessName: string;
  buyerType: string;
  description: string | null;
  region: string;
  district: string;
  town: string;
  latitude: number;
  longitude: number;
  preferredProduce: string[];
  minimumOrderQuantity: number | null;
  maximumTravelDistanceKm: number;
  verificationStatus: AdminVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardOverview {
  totals: {
    users: number;
    farmers: number;
    buyers: number;
    verifiedFarmers: number;
    activeListings: number;
    pendingOffers: number;
    acceptedOffers: number;
    completedTransactions: number;
    successfulMatches: number;
    listingsApproachingExpiration: number;
  };
  estimatedTotalTransactionValue: number;
  averageMatchScore: number;
  listingsByCategory: Array<{ categoryId: string; category: string; count: number }>;
  listingsByRegion: Array<{ region: string; count: number }>;
  recentActivities: AdminAuditLog[];
}

export interface AdminAnalyticsTrendPoint {
  date: string;
  newUsers: number;
  newListings: number;
  newOffers: number;
  completedTransactions: number;
  transactionValue: number;
}

export interface AdminAnalytics {
  generatedAt: string;
  periodDays: number;
  trends: AdminAnalyticsTrendPoint[];
  funnel: {
    publishedListings: number;
    totalMatches: number;
    offersSent: number;
    offersAccepted: number;
    completedTransactions: number;
    activeDemands: number;
    conversionRates: {
      listingToMatch: number;
      matchToOffer: number;
      offerToAccept: number;
      acceptToComplete: number;
    };
    offersFromMatchedListings: number;
  };
  offersByStatus: Array<{ status: string; count: number }>;
  transactionsByStatus: Array<{ status: string; count: number }>;
  listingsByStatus: Array<{ status: string; count: number }>;
  matchesByStatus: Array<{ status: string; count: number }>;
  usersByRole: Array<{ role: string; count: number }>;
  buyersByType: Array<{ buyerType: string; count: number }>;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  averageMatchScore: number;
  matchScoreDistribution: Array<{ bucket: string; count: number }>;
  ratingsSummary: {
    totalRatings: number;
    averageScore: number;
    farmerAverageScore: number;
    buyerAverageScore: number;
  };
  weeklyComparison: {
    listingsThisWeek: number;
    listingsLastWeek: number;
    offersThisWeek: number;
    offersLastWeek: number;
    transactionsThisWeek: number;
    transactionsLastWeek: number;
    gmvThisWeek: number;
    gmvLastWeek: number;
  };
  listingsByCategory: Array<{ categoryId: string; category: string; count: number }>;
  listingsByRegion: Array<{ region: string; count: number }>;
  totals: {
    listings: number;
    matches: number;
    offers: number;
    transactions: number;
  };
}

export interface AdminListing {
  id: string;
  farmerId: string;
  categoryId: string;
  title: string;
  description: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  unit: string;
  minimumOrderQuantity: number | null;
  pricePerUnit: number | null;
  currency: string;
  harvestDate: string;
  availableFrom: string;
  availableUntil: string | null;
  region: string;
  district: string;
  town: string;
  latitude: number;
  longitude: number;
  status: AdminListingStatus;
  sourceType: string;
  rawInputText: string | null;
  aiExtractionConfidence: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug: string };
  farmer?: {
    id: string;
    farmName: string;
    region: string;
    district: string;
    town: string;
    verificationStatus: AdminVerificationStatus;
  };
}

export interface AdminOffer {
  id: string;
  listingId: string;
  buyerId: string;
  offeredQuantity: number;
  unit: string;
  offeredPricePerUnit: number;
  totalAmount: number;
  message: string | null;
  proposedPickupDate: string;
  status: AdminOfferStatus;
  expiresAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  listing?: { id: string; title: string; farmerId?: string };
  buyer?: { id: string; businessName: string };
}

export interface AdminTransaction {
  id: string;
  offerId: string;
  listingId: string;
  farmerId: string;
  buyerId: string;
  agreedQuantity: number;
  unit: string;
  agreedPricePerUnit: number;
  totalAmount: number;
  pickupDate: string;
  status: AdminTransactionStatus;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  listing?: { id: string; title: string };
  buyer?: { id: string; businessName: string };
}

export interface AdminMatch {
  id: string;
  listingId: string;
  buyerId: string;
  score: number;
  produceScore: number;
  quantityScore: number;
  distanceScore: number;
  dateScore: number;
  priceScore: number;
  explanation: string;
  status: AdminMatchStatus;
  generatedAt: string;
  viewedAt: string | null;
  listing?: { id: string; title: string };
  buyer?: { id: string; businessName: string };
}

export interface AdminDemand {
  id: string;
  buyerId: string;
  buyerName: string;
  categoryId: string;
  categoryName: string;
  minimumQuantity: number;
  maximumQuantity: number | null;
  unit: string;
  preferredPriceMaximum: number | null;
  requiredFrom: string | null;
  requiredUntil: string | null;
  preferredRegions: string[];
  isRecurring: boolean;
  frequency: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminTransportSuggestion {
  id: string;
  primaryListingId: string;
  secondaryListingId: string;
  primaryTitle: string;
  secondaryTitle: string;
  primaryFarmer: string;
  secondaryFarmer: string;
  distanceBetweenFarmsKm: number;
  destinationSimilarityScore: number;
  estimatedSavingsPercentage: number | null;
  explanation: string;
  status: AdminTransportStatus;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AdminHealthStatus {
  success: boolean;
  status: string;
  service: string;
  timestamp: string;
  environment: string;
  database?: { connected: boolean };
}

export interface AdminListResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  role?: AdminUserRole;
  status?: AdminAccountStatus;
  search?: string;
}

export interface AdminListingsQuery {
  page?: number;
  limit?: number;
  status?: AdminListingStatus;
  region?: string;
  category?: string;
}

export interface AdminGenericQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}
