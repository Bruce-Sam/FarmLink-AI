'use client';

import { useQuery } from '@tanstack/react-query';
import { healthApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { cn } from '@/lib/utils';

interface ApiHealthBannerProps {
  className?: string;
  /** Shown when the API is unreachable. */
  offlineMessage?: string;
}

export function ApiHealthBanner({
  className,
  offlineMessage = 'API unreachable — start the backend on port 4000',
}: ApiHealthBannerProps) {
  const healthQuery = useQuery({
    queryKey: queryKeys.admin.health(),
    queryFn: () => healthApi.getApiHealth().catch(() => null),
    retry: false,
    staleTime: 30_000,
  });

  const apiOnline = healthQuery.data?.success ?? false;

  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm',
        apiOnline
          ? 'border-leaf-green/30 bg-leaf-green/10 text-farm-green'
          : 'border-clay-orange/30 bg-clay-orange/10 text-clay-orange',
        className,
      )}
    >
      <span
        className={cn('size-2 shrink-0 rounded-full', apiOnline ? 'bg-leaf-green' : 'bg-clay-orange')}
        aria-hidden
      />
      {healthQuery.isLoading
        ? 'Checking API connection…'
        : apiOnline
          ? 'Live API connected — sign in with your account'
          : offlineMessage}
    </div>
  );
}
