import { apiGet, apiPost } from './client';
import type { Offer, OfferActionPayload } from '@/types/offer';
import { mapBackendOffer } from './mappers/backend-mappers';

export async function getOffers(): Promise<Offer[]> {
  const response = await apiGet<{ offers: Record<string, unknown>[] }>('/farmers/offers');
  return (response.data.offers ?? []).map(mapBackendOffer);
}

export async function getOffer(id: string): Promise<Offer> {
  const response = await apiGet<{ offer: Record<string, unknown> }>(`/farmers/offers/${id}`);
  return mapBackendOffer(response.data.offer);
}

export async function acceptOffer(id: string): Promise<Offer> {
  const response = await apiPost<{ offer?: Record<string, unknown>; transaction?: Record<string, unknown> }>(
    `/farmers/offers/${id}/accept`,
  );
  if (response.data.offer) {
    return mapBackendOffer(response.data.offer);
  }
  return getOffer(id);
}

export async function rejectOffer(id: string, _payload?: OfferActionPayload): Promise<Offer> {
  const response = await apiPost<{ offer: Record<string, unknown> }>(
    `/farmers/offers/${id}/reject`,
  );
  return mapBackendOffer(response.data.offer);
}

export async function counterOffer(_id: string, _payload: OfferActionPayload): Promise<Offer> {
  throw new Error('Counter offers are not supported yet.');
}
