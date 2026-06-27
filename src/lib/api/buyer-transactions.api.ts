import { apiGet } from './client';
import type { Transaction } from '@/types/transaction';
import { mapBackendTransaction } from './mappers/backend-mappers';

export async function getBuyerTransactions(): Promise<Transaction[]> {
  const response = await apiGet<{ transactions: Record<string, unknown>[] }>(
    '/buyers/transactions',
  );
  return (response.data.transactions ?? []).map(mapBackendTransaction);
}

export async function getBuyerTransaction(id: string): Promise<Transaction> {
  const response = await apiGet<{ transaction: Record<string, unknown> }>(
    `/buyers/transactions/${id}`,
  );
  return mapBackendTransaction(response.data.transaction);
}
