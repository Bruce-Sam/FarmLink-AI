'use client';

import { AdminPageHeader } from '@/components/admin/page-header';
import { RegionalActivityGrid } from '@/components/admin/regional-activity-grid';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAdminDashboard } from '@/features/admin/hooks/use-admin-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminRegionalActivityScreen() {
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Regional activity"
        description="Geographic distribution of active produce listings across Ghana's regions."
      />
      <RegionalActivityGrid data={data.listingsByRegion} />
    </div>
  );
}
