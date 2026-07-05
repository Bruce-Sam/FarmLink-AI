'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/admin/metric-card';
import { formatCompactGhs } from '@/lib/formatters/currency';
import { cn } from '@/lib/utils';
import type { AdminAnalytics } from '@/types/admin';

function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function DeltaBadge({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-xs text-muted-foreground">No change vs last week</span>;
  }
  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        up ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {up ? '+' : ''}
      {value}% vs last week
    </span>
  );
}

interface AdminWeekComparisonProps {
  comparison: AdminAnalytics['weeklyComparison'];
}

export function AdminWeekComparison({ comparison }: AdminWeekComparisonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="New listings"
        value={comparison.listingsThisWeek}
        hint={<DeltaBadge value={calcChange(comparison.listingsThisWeek, comparison.listingsLastWeek)} />}
      />
      <MetricCard
        label="Offers sent"
        value={comparison.offersThisWeek}
        hint={<DeltaBadge value={calcChange(comparison.offersThisWeek, comparison.offersLastWeek)} />}
      />
      <MetricCard
        label="Transactions"
        value={comparison.transactionsThisWeek}
        hint={
          <DeltaBadge
            value={calcChange(comparison.transactionsThisWeek, comparison.transactionsLastWeek)}
          />
        }
      />
      <MetricCard
        label="Weekly GMV"
        value={formatCompactGhs(comparison.gmvThisWeek)}
        hint={<DeltaBadge value={calcChange(comparison.gmvThisWeek, comparison.gmvLastWeek)} />}
      />
    </div>
  );
}
