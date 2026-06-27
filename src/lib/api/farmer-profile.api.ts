import { apiGet, apiPatch, apiPost } from './client';
import type { FarmerProfile, FarmerProfileUpdate, OnboardingData } from '@/types/farmer';
import {
  mapBackendFarmerProfile,
  toBackendFarmerProfilePayload,
} from './mappers/backend-mappers';

export async function getFarmerProfile(): Promise<FarmerProfile> {
  const response = await apiGet<{ profile: Record<string, unknown> }>('/farmers/profile');
  return mapBackendFarmerProfile(response.data.profile);
}

export async function updateFarmerProfile(update: FarmerProfileUpdate): Promise<FarmerProfile> {
  const response = await apiPatch<{ profile: Record<string, unknown> }>(
    '/farmers/profile',
    toBackendFarmerProfilePayload(update),
  );
  return mapBackendFarmerProfile(response.data.profile);
}

export async function completeOnboarding(data: OnboardingData): Promise<FarmerProfile> {
  const response = await apiPost<{ profile: Record<string, unknown> }>(
    '/farmers/profile',
    toBackendFarmerProfilePayload(data),
  );
  return mapBackendFarmerProfile(response.data.profile);
}
