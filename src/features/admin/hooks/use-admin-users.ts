import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { AdminUsersQuery } from '@/types/admin';

export function useAdminUsers(query: AdminUsersQuery = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users(query),
    queryFn: () => adminApi.listUsers(query),
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.admin.user(userId),
    queryFn: () => adminApi.getUser(userId),
    enabled: Boolean(userId),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.user(userId) });
    },
  });
}
