import { apiPost } from './client';
import type { ExtractionResult } from '@/types/listing';
import { mapBackendExtraction } from './mappers/backend-mappers';

export interface ExtractListingPayload {
  text?: string;
  imageUrl?: string;
  imageBase64?: string;
}

export async function extractListingFields(
  payload: ExtractListingPayload,
): Promise<ExtractionResult> {
  if (!payload.text?.trim()) {
    throw new Error('Text extraction requires a description of your produce.');
  }
  const response = await apiPost<{ extraction: Record<string, unknown> }>('/listings/extract', {
    text: payload.text,
  });
  return mapBackendExtraction(response.data.extraction);
}
