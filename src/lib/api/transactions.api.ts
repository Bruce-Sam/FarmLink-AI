import { apiGet } from './client';
import type { Transaction } from '@/types/transaction';
import { mapBackendTransaction } from './mappers/backend-mappers';

export async function getTransactions(): Promise<Transaction[]> {
  const response = await apiGet<{ transactions: Record<string, unknown>[] }>(
    '/farmers/transactions',
  );
  return (response.data.transactions ?? []).map(mapBackendTransaction);
}

export async function getTransaction(id: string): Promise<Transaction> {
  const response = await apiGet<{ transaction: Record<string, unknown> }>(
    `/farmers/transactions/${id}`,
  );
  return mapBackendTransaction(response.data.transaction);
}
