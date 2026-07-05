'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Handshake,
  ShoppingBasket,
  Sparkles,
  Tractor,
  Users,
  Warehouse,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { MetricCard } from '@/components/admin/metric-card';
import { MarketplacePulse } from '@/components/admin/marketplace-pulse';
import { ActivityTimeline } from '@/components/admin/activity-timeline';
import { RegionalActivityGrid } from '@/components/admin/regional-activity-grid';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAdminDashboard } from '@/features/admin/hooks/use-admin-dashboard';
import { formatCompactGhs, formatGhs } from '@/lib/formatters/currency';
import { getGreeting } from '@/lib/formatters/dates';
import { ADMIN_ROUTES } from '@/constants/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const CategoryChart = dynamic(
  () => import('@/features/admin/components/AdminCategoryChart').then((m) => m.AdminCategoryChart),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-lg bg-muted" /> },
);

export function AdminDashboardScreen() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Command Centre" description="Loading platform intelligence…" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MetricCard key={i} label="" value="" loading />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Could not load command centre"
        message="The dashboard overview is unavailable. Check API connectivity and try again."
        onRetry={() => void refetch()}
      />
    );
  }

  const { totals } = data;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`${getGreeting()}, ${user?.fullName?.split(' ')[0] ?? 'Administrator'}`}
        description="Harvest Intelligence Command Centre — real-time marketplace health, match quality, and operational pulse across Ghana."
        actions={
          <Button variant="outline" asChild>
            <Link href={ADMIN_ROUTES.analytics}>Full statistical analysis</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total users" value={totals.users} icon={Users} hint={`${totals.farmers} farmers · ${totals.buyers} buyers`} />
        <MetricCard label="Verified farmers" value={totals.verifiedFarmers} icon={Tractor} />
        <MetricCard label="Active listings" value={totals.activeListings} icon={Warehouse} hint={`${totals.listingsApproachingExpiration} expiring soon`} />
        <MetricCard label="Pending offers" value={totals.pendingOffers} icon={Handshake} hint={`${totals.acceptedOffers} accepted`} />
        <MetricCard label="Completed transactions" value={totals.completedTransactions} icon={ShoppingBasket} />
        <MetricCard label="Successful matches" value={totals.successfulMatches} icon={Sparkles} hint={`Avg score ${data.averageMatchScore.toFixed(1)}%`} />
        <MetricCard label="Transaction value" value={formatCompactGhs(data.estimatedTotalTransactionValue)} hint={formatGhs(data.estimatedTotalTransactionValue)} />
        <MetricCard label="Match quality" value={`${data.averageMatchScore.toFixed(1)}%`} icon={Sparkles} hint="Platform-wide average" />
      </div>

      <MarketplacePulse byCategory={data.listingsByCategory} byRegion={data.listingsByRegion} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Listings by category</CardTitle>
          </CardHeader>
          <CardContent>
            {data.listingsByCategory.length === 0 ? (
              <EmptyState title="No listing data" description="Category breakdown will appear once listings are published." />
            ) : (
              <CategoryChart data={data.listingsByCategory} />
            )}
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent activity</CardTitle>
            <Button variant="link" size="sm" asChild>
              <Link href={ADMIN_ROUTES.auditLogs}>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ActivityTimeline activities={data.recentActivities} limit={6} />
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-lg font-semibold">Regional supply heatmap</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href={ADMIN_ROUTES.regionalActivity}>Full regional view</Link>
          </Button>
        </div>
        <RegionalActivityGrid data={data.listingsByRegion} />
      </section>
    </div>
  );
}
