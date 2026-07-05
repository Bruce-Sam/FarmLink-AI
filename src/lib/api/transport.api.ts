import { apiGet } from './client';
import type { TransportSuggestion } from '@/types/transport';
import { mapBackendTransportSuggestion } from './mappers/backend-mappers';

export async function getTransportSuggestions(): Promise<TransportSuggestion[]> {
  const response = await apiGet<{ suggestions: Record<string, unknown>[] }>(
    '/farmers/transport-suggestions',
  );
  return (response.data.suggestions ?? []).map(mapBackendTransportSuggestion);
}

export async function getTransactionTransportSuggestions(transactionId?: string): Promise<TransportSuggestion[]> {
  void transactionId;
  return getTransportSuggestions();
}
