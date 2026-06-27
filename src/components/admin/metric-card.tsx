import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
  loading?: boolean;
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
  loading,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className={cn('admin-card border-admin-border', className)}>
        <CardContent className="p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('admin-card border-admin-border', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="admin-label">{label}</p>
          {Icon && (
            <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]">
              <Icon className="size-4" aria-hidden />
            </span>
          )}
        </div>
        <p className="admin-metric-value mt-2 text-2xl text-[var(--admin-ink)]">{value}</p>
        {(hint || trend) && (
          <p className="mt-1.5 text-xs text-[var(--admin-muted)]">
            {trend && (
              <span
                className={cn(
                  'mr-2 font-medium',
                  trend.positive ? 'text-farm-green' : 'text-clay-orange',
                )}
              >
                {trend.value}
              </span>
            )}
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
