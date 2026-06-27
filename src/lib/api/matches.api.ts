import { apiGet } from './client';
import type { BuyerMatch } from '@/types/match';
import { mapBackendListingMatch } from './mappers/backend-mappers';

export async function getMatches(): Promise<BuyerMatch[]> {
  return [];
}

export async function getListingMatches(listingId: string): Promise<BuyerMatch[]> {
  const response = await apiGet<{ matches: Record<string, unknown>[] }>(
    `/listings/${listingId}/matches`,
  );
  return (response.data.matches ?? []).map(mapBackendListingMatch);
}
