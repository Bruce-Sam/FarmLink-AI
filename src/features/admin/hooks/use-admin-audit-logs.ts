import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { AdminGenericQuery } from '@/types/admin';

export function useAdminAuditLogs(query: AdminGenericQuery = {}) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(query),
    queryFn: () => adminApi.listAuditLogs(query),
  });
}
