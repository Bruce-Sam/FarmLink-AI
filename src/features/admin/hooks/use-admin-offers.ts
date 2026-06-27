import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { AdminGenericQuery } from '@/types/admin';

export function useAdminOffers(query: AdminGenericQuery = {}) {
  return useQuery({
    queryKey: queryKeys.admin.offers(query),
    queryFn: () => adminApi.listOffers(query),
  });
}
