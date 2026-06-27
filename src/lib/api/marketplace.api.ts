import { apiGet } from './client';
import type { MarketplaceFilters, MarketplaceListing } from '@/types/buyer';
import { mapBackendListingToMarketplace } from './mappers/backend-mappers';

function buildQuery(filters?: MarketplaceFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  const mapping: Record<string, string> = {
    category: 'category',
    region: 'region',
    district: 'district',
    town: 'town',
    unit: 'unit',
    minQuantity: 'minQuantity',
    maxPrice: 'maxPrice',
    availableFrom: 'availableFrom',
    harvestFrom: 'harvestDateFrom',
    harvestUntil: 'harvestDateTo',
    maxDistance: 'maxDistanceKm',
    sort: 'sort',
    page: 'page',
    limit: 'limit',
    search: 'search',
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return;
    const paramKey = mapping[key] ?? key;
    if (key === 'unit' && typeof value === 'string') {
      params.set(paramKey, value.toUpperCase());
    } else {
      params.set(paramKey, String(value));
    }
  });

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function getMarketplaceListings(
  filters?: MarketplaceFilters,
): Promise<MarketplaceListing[]> {
  const response = await apiGet<{ listings: Record<string, unknown>[] }>(
    `/marketplace/listings${buildQuery(filters)}`,
  );
  return (response.data.listings ?? []).map(mapBackendListingToMarketplace);
}

export async function getMarketplaceListing(id: string): Promise<MarketplaceListing> {
  const response = await apiGet<{ listing: Record<string, unknown> }>(
    `/marketplace/listings/${id}`,
  );
  return mapBackendListingToMarketplace(response.data.listing);
}
