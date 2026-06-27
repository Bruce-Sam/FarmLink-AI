import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';

export function useAdminTransport() {
  return useQuery({
    queryKey: queryKeys.admin.transport(),
    queryFn: adminApi.listTransportSuggestions,
  });
}
