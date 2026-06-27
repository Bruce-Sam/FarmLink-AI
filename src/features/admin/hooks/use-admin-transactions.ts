import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { AdminGenericQuery } from '@/types/admin';

export function useAdminTransactions(query: AdminGenericQuery = {}) {
  return useQuery({
    queryKey: queryKeys.admin.transactions(query),
    queryFn: () => adminApi.listTransactions(query),
  });
}
