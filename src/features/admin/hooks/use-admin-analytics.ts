import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';

export function useAdminAnalytics() {
  return useQuery({
    queryKey: queryKeys.admin.analytics(),
    queryFn: adminApi.getAnalytics,
  });
}
