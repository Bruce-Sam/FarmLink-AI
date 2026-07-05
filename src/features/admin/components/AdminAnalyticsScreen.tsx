'use client';

import dynamic from 'next/dynamic';
import { Users, Star, Target, Activity } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { MetricCard } from '@/components/admin/metric-card';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAdminAnalytics } from '@/features/admin/hooks/use-admin-analytics';
import { AdminWeekComparison } from '@/features/admin/components/AdminWeekComparison';
import { AdminFunnelPanel } from '@/features/admin/components/AdminFunnelPanel';
import { formatCompactGhs } from '@/lib/formatters/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ActivityTrendChart = dynamic(
  () =>
    import('@/features/admin/components/AdminActivityTrendChart').then(
      (m) => m.AdminActivityTrendChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-80 w-full" /> },
);

const RegionChart = dynamic(
  () => import('@/features/admin/components/AdminRegionChart').then((m) => m.AdminRegionChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

const CategoryChart = dynamic(
  () => import('@/features/admin/components/AdminCategoryChart').then((m) => m.AdminCategoryChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

const StatusBreakdownChart = dynamic(
  () =>
    import('@/features/admin/components/AdminStatusBreakdownChart').then(
      (m) => m.AdminStatusBreakdownChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-60 w-full" /> },
);

const MatchScoreDistribution = dynamic(
  () =>
    import('@/features/admin/components/AdminMatchScoreDistribution').then(
      (m) => m.AdminMatchScoreDistribution,
    ),
  { ssr: false, loading: () => <Skeleton className="h-60 w-full" /> },
);

function formatBuyerType(type: string): string {
  return type
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function AdminAnalyticsScreen() {
  const { data, isLoading, isError, refetch } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Platform analytics" description="Loading statistical analysis…" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MetricCard key={i} label="" value="" loading />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState title="Analytics unavailable" onRetry={() => void refetch()} />;
  }

  const totalGmv = data.trends.reduce((sum, point) => sum + point.transactionValue, 0);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Platform analytics"
        description={`Statistical analysis across the last ${data.periodDays} days — user growth, marketplace funnel, deal pipeline, and trust signals.`}
      />

      <AdminWeekComparison comparison={data.weeklyComparison} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="New users (30d)"
          value={data.newUsersLast30Days}
          icon={Users}
          hint={`${data.newUsersLast7Days} in the last 7 days`}
        />
        <MetricCard
          label="Total platform GMV (30d)"
          value={formatCompactGhs(totalGmv)}
          icon={Activity}
        />
        <MetricCard
          label="Avg match score"
          value={`${data.averageMatchScore.toFixed(1)}%`}
          icon={Target}
        />
        <MetricCard
          label="Partner ratings"
          value={data.ratingsSummary.totalRatings}
          icon={Star}
          hint={
            data.ratingsSummary.totalRatings > 0
              ? `Avg ${data.ratingsSummary.averageScore.toFixed(1)}/5 · Farmers ${data.ratingsSummary.farmerAverageScore.toFixed(1)} · Buyers ${data.ratingsSummary.buyerAverageScore.toFixed(1)}`
              : 'No ratings submitted yet'
          }
        />
      </div>

      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-base">Activity trends ({data.periodDays} days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTrendChart trends={data.trends} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Marketplace funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminFunnelPanel funnel={data.funnel} />
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Match score distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchScoreDistribution
              data={data.matchScoreDistribution}
              averageScore={data.averageMatchScore}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Offers by status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBreakdownChart data={data.offersByStatus} color="var(--admin-accent)" />
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Transactions by status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBreakdownChart data={data.transactionsByStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Listings by status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBreakdownChart data={data.listingsByStatus} color="#66a36f" />
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Matches by status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBreakdownChart data={data.matchesByStatus} color="#d7a33e" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Listings by region</CardTitle>
          </CardHeader>
          <CardContent>
            <RegionChart data={data.listingsByRegion} />
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Listings by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={data.listingsByCategory} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Users by role</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.usersByRole.map((item) => (
                <li key={item.role} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.role}</span>
                  <span className="tabular-nums text-muted-foreground">{item.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Buyers by business type</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.buyersByType.map((item) => (
                <li key={item.buyerType} className="flex items-center justify-between text-sm">
                  <span>{formatBuyerType(item.buyerType)}</span>
                  <span className="font-medium tabular-nums">{item.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
