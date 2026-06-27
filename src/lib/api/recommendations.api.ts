import { apiGet } from './client';
import type { BuyerRecommendation } from '@/types/buyer';
import { mapBackendRecommendation } from './mappers/backend-mappers';

export async function getRecommendations(): Promise<BuyerRecommendation[]> {
  const response = await apiGet<{ recommendations: Record<string, unknown>[] }>(
    '/buyers/recommendations',
  );
  return (response.data.recommendations ?? []).map(mapBackendRecommendation);
}

export async function getRecommendation(id: string): Promise<BuyerRecommendation> {
  const response = await apiGet<{ recommendation: Record<string, unknown> }>(
    `/buyers/recommendations/${id}`,
  );
  return mapBackendRecommendation(response.data.recommendation);
}
