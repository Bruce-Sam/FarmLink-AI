import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';

export function useAdminDemands() {
  return useQuery({
    queryKey: queryKeys.admin.demands(),
    queryFn: adminApi.listDemands,
  });
}
