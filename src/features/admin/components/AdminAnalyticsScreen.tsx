'use client';

import dynamic from 'next/dynamic';
import { AdminPageHeader } from '@/components/admin/page-header';
import { MetricCard } from '@/components/admin/metric-card';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAdminDashboard } from '@/features/admin/hooks/use-admin-dashboard';
import { formatCompactGhs } from '@/lib/formatters/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const RegionChart = dynamic(
  () => import('@/features/admin/components/AdminRegionChart').then((m) => m.AdminRegionChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

const CategoryChart = dynamic(
  () => import('@/features/admin/components/AdminCategoryChart').then((m) => m.AdminCategoryChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

export function AdminAnalyticsScreen() {
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Analytics" description="Loading charts…" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState title="Analytics unavailable" onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Platform analytics"
        description="Marketplace composition, regional distribution, and match quality trends."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active listings" value={data.totals.activeListings} />
        <MetricCard label="Match success rate" value={`${data.averageMatchScore.toFixed(1)}%`} />
        <MetricCard label="Completed deals" value={data.totals.completedTransactions} />
        <MetricCard label="Platform GMV" value={formatCompactGhs(data.estimatedTotalTransactionValue)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">Listings by region</CardTitle></CardHeader>
          <CardContent><RegionChart data={data.listingsByRegion} /></CardContent>
        </Card>
        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">Listings by category</CardTitle></CardHeader>
          <CardContent><CategoryChart data={data.listingsByCategory} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
