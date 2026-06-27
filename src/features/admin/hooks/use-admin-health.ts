import { useQuery } from '@tanstack/react-query';
import { healthApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';

export function useAdminHealth() {
  return useQuery({
    queryKey: queryKeys.admin.health(),
    queryFn: async () => {
      const [api, root] = await Promise.allSettled([
        healthApi.getApiHealth(),
        healthApi.getRootHealth(),
      ]);
      return {
        api: api.status === 'fulfilled' ? api.value : null,
        root: root.status === 'fulfilled' ? root.value : null,
      };
    },
    refetchInterval: 60_000,
  });
}
