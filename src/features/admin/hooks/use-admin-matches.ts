import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { AdminGenericQuery } from '@/types/admin';

export function useAdminMatches(query: AdminGenericQuery = {}) {
  return useQuery({
    queryKey: queryKeys.admin.matches(query),
    queryFn: () => adminApi.listMatches(query),
  });
}
