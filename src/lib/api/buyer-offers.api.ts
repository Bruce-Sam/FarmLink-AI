import { apiGet, apiPost } from './client';
import type { CreateOfferPayload, Offer } from '@/types/offer';
import { mapBackendOffer, toBackendCreateOfferPayload } from './mappers/backend-mappers';

export async function getBuyerOffers(): Promise<Offer[]> {
  const response = await apiGet<{ offers: Record<string, unknown>[] }>('/buyers/offers');
  return (response.data.offers ?? []).map(mapBackendOffer);
}

export async function getBuyerOffer(id: string): Promise<Offer> {
  const response = await apiGet<{ offer: Record<string, unknown> }>(`/buyers/offers/${id}`);
  return mapBackendOffer(response.data.offer);
}

export async function createOffer(payload: CreateOfferPayload): Promise<Offer> {
  const response = await apiPost<{ offer: Record<string, unknown> }>(
    '/offers',
    toBackendCreateOfferPayload(payload),
  );
  return mapBackendOffer(response.data.offer);
}

export async function cancelBuyerOffer(id: string): Promise<Offer> {
  const response = await apiPost<{ offer: Record<string, unknown> }>(
    `/buyers/offers/${id}/cancel`,
  );
  return mapBackendOffer(response.data.offer);
}
