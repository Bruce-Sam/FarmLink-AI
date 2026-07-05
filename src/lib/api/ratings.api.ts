import { apiGet, apiPost } from './client';
import type {
  CreateRatingPayload,
  PartnerRating,
  RatingSummary,
  TransactionRatingContext,
} from '@/types/rating';

function mapRating(raw: Record<string, unknown>): PartnerRating {
  return {
    id: String(raw.id),
    transactionId: String(raw.transactionId),
    raterUserId: String(raw.raterUserId),
    raterName: raw.raterName ? String(raw.raterName) : undefined,
    ratedUserId: String(raw.ratedUserId),
    ratedRole: raw.ratedRole === 'buyer' ? 'buyer' : 'farmer',
    score: Number(raw.score),
    comment: raw.comment ? String(raw.comment) : undefined,
    createdAt: String(raw.createdAt),
  };
}

function mapSummary(raw: Record<string, unknown>): RatingSummary {
  const recent = (raw.recentRatings as Record<string, unknown>[] | undefined) ?? [];
  return {
    averageScore: Number(raw.averageScore ?? 0),
    totalRatings: Number(raw.totalRatings ?? 0),
    recentRatings: recent.map(mapRating),
  };
}

export async function submitRating(payload: CreateRatingPayload): Promise<PartnerRating> {
  const response = await apiPost<{ rating: Record<string, unknown> }>('/ratings', payload);
  return mapRating(response.data.rating);
}

export async function getUserRatingSummary(userId: string): Promise<RatingSummary> {
  const response = await apiGet<{ summary: Record<string, unknown> }>(
    `/ratings/users/${userId}/summary`,
  );
  return mapSummary(response.data.summary);
}

export async function getFarmerRatingSummary(farmerProfileId: string): Promise<RatingSummary> {
  const response = await apiGet<{ summary: Record<string, unknown> }>(
    `/ratings/farmers/${farmerProfileId}/summary`,
  );
  return mapSummary(response.data.summary);
}

export async function getBuyerRatingSummary(buyerProfileId: string): Promise<RatingSummary> {
  const response = await apiGet<{ summary: Record<string, unknown> }>(
    `/ratings/buyers/${buyerProfileId}/summary`,
  );
  return mapSummary(response.data.summary);
}

export async function getTransactionRatings(
  transactionId: string,
): Promise<TransactionRatingContext> {
  const response = await apiGet<{
    ratings: Record<string, unknown>[];
    myRating: Record<string, unknown> | null;
    canRate: boolean;
    targetRole: string;
  }>(`/ratings/transactions/${transactionId}`);

  return {
    ratings: (response.data.ratings ?? []).map(mapRating),
    myRating: response.data.myRating ? mapRating(response.data.myRating) : null,
    canRate: Boolean(response.data.canRate),
    targetRole: response.data.targetRole === 'buyer' ? 'buyer' : 'farmer',
  };
}
