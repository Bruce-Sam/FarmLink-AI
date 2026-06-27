import { apiGet, apiPatch, apiPost } from './client';
import type {
  Listing,
  ListingCreatePayload,
  ListingUpdatePayload,
} from '@/types/listing';
import {
  mapBackendListing,
  toBackendListingCreatePayload,
  toBackendListingUpdatePayload,
} from './mappers/backend-mappers';
import { getFarmerProfile } from './farmer-profile.api';

export async function getListings(): Promise<Listing[]> {
  const response = await apiGet<{ listings: Record<string, unknown>[] }>('/listings/my');
  return (response.data.listings ?? []).map(mapBackendListing);
}

export async function getListing(id: string): Promise<Listing> {
  const response = await apiGet<{ listing: Record<string, unknown> }>(`/listings/${id}`);
  return mapBackendListing(response.data.listing);
}

export async function createListing(payload: ListingCreatePayload): Promise<Listing> {
  const profile = await getFarmerProfile();
  const response = await apiPost<{ listing: Record<string, unknown> }>(
    '/listings',
    toBackendListingCreatePayload(payload, profile),
  );
  return mapBackendListing(response.data.listing);
}

export async function updateListing(
  id: string,
  payload: ListingUpdatePayload,
): Promise<Listing> {
  const response = await apiPatch<{ listing: Record<string, unknown> }>(
    `/listings/${id}`,
    toBackendListingUpdatePayload(payload),
  );
  return mapBackendListing(response.data.listing);
}

export async function patchListing(
  id: string,
  payload: ListingUpdatePayload,
): Promise<Listing> {
  return updateListing(id, payload);
}

export async function publishListing(id: string): Promise<Listing> {
  const response = await apiPost<{ listing: Record<string, unknown> }>(
    `/listings/${id}/publish`,
  );
  return mapBackendListing(response.data.listing);
}

export async function cancelListing(id: string): Promise<Listing> {
  const response = await apiPost<{ listing: Record<string, unknown> }>(
    `/listings/${id}/cancel`,
  );
  return mapBackendListing(response.data.listing);
}

export async function deleteListing(id: string): Promise<void> {
  await cancelListing(id);
}

export async function getListingOffers(listingId: string) {
  const response = await apiGet<{ matches: Record<string, unknown>[] }>(
    `/listings/${listingId}/matches`,
  );
  return response.data.matches ?? [];
}
