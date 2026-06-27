import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import type {
  BuyerDemand,
  BuyerDemandPayload,
  BuyerOnboardingData,
  BuyerProfile,
  BuyerProfileUpdate,
} from '@/types/buyer';
import {
  mapBackendBuyerProfile,
  mapBackendDemand,
  resolveCategoryId,
  toBackendBuyerProfilePayload,
  toBackendDemandPayload,
  toBackendUnit,
} from './mappers/backend-mappers';
import { getCategories } from './categories.api';

export async function getBuyerProfile(): Promise<BuyerProfile> {
  const response = await apiGet<{ profile: Record<string, unknown> }>('/buyers/profile');
  return mapBackendBuyerProfile(response.data.profile);
}

export async function updateBuyerProfile(update: BuyerProfileUpdate): Promise<BuyerProfile> {
  const response = await apiPatch<{ profile: Record<string, unknown> }>(
    '/buyers/profile',
    toBackendBuyerProfilePayload(update),
  );
  return mapBackendBuyerProfile(response.data.profile);
}

export async function completeBuyerOnboarding(data: BuyerOnboardingData): Promise<BuyerProfile> {
  const response = await apiPost<{ profile: Record<string, unknown> }>(
    '/buyers/profile',
    toBackendBuyerProfilePayload(data),
  );
  return mapBackendBuyerProfile(response.data.profile);
}

export async function getBuyerDemands(): Promise<BuyerDemand[]> {
  const response = await apiGet<{ demands: Record<string, unknown>[] }>('/buyers/demands');
  return (response.data.demands ?? []).map(mapBackendDemand);
}

export async function getBuyerDemand(id: string): Promise<BuyerDemand> {
  const response = await apiGet<{ demand: Record<string, unknown> }>(`/buyers/demands/${id}`);
  return mapBackendDemand(response.data.demand);
}

export async function createBuyerDemand(payload: BuyerDemandPayload): Promise<BuyerDemand> {
  const categoryId = await resolveCategoryId(payload, getCategories);
  const response = await apiPost<{ demand: Record<string, unknown> }>(
    '/buyers/demands',
    toBackendDemandPayload(payload, categoryId),
  );
  return mapBackendDemand(response.data.demand);
}

export async function updateBuyerDemand(
  id: string,
  payload: Partial<BuyerDemandPayload>,
): Promise<BuyerDemand> {
  const categoryId = payload.produceCategoryId ?? payload.produceCategory
    ? await resolveCategoryId(payload as BuyerDemandPayload, getCategories)
    : undefined;

  const body: Record<string, unknown> = {};
  if (categoryId) body.categoryId = categoryId;
  if (payload.quantityMin != null) body.minimumQuantity = payload.quantityMin;
  if (payload.quantityMax != null) body.maximumQuantity = payload.quantityMax;
  if (payload.unit) body.unit = toBackendUnit(payload.unit);
  if (payload.preferredMaxPrice != null) body.preferredPriceMaximum = payload.preferredMaxPrice;
  if (payload.requiredFrom) body.requiredFrom = payload.requiredFrom;
  if (payload.requiredUntil) body.requiredUntil = payload.requiredUntil;
  if (payload.preferredRegions) body.preferredRegions = payload.preferredRegions;
  if (payload.isRecurring != null) body.isRecurring = payload.isRecurring;
  if (payload.frequency) body.frequency = payload.frequency;
  if (payload.status) body.isActive = payload.status !== 'inactive';

  const response = await apiPatch<{ demand: Record<string, unknown> }>(
    `/buyers/demands/${id}`,
    body,
  );
  return mapBackendDemand(response.data.demand);
}

export async function deleteBuyerDemand(id: string): Promise<void> {
  await apiDelete<void>(`/buyers/demands/${id}`);
}
