import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { AdminListingsQuery } from '@/types/admin';

export function useAdminListings(query: AdminListingsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.admin.listings(query),
    queryFn: () => adminApi.listListings(query),
  });
}

export function useAdminListing(listingId: string) {
  return useQuery({
    queryKey: queryKeys.admin.listing(listingId),
    queryFn: () => adminApi.getListing(listingId),
    enabled: Boolean(listingId),
  });
}

export function useUpdateListingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, status }: { listingId: string; status: string }) =>
      adminApi.updateListingStatus(listingId, status),
    onSuccess: (_, { listingId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.listings() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.listing(listingId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    },
  });
}

export function useRegenerateMatches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) => adminApi.regenerateMatches(listingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.matches() });
    },
  });
}
