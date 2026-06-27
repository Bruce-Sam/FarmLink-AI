import { cn } from '@/lib/utils';

interface RegionalActivityGridProps {
  data: Array<{ region: string; count: number }>;
  className?: string;
}

export function RegionalActivityGrid({ data, className }: RegionalActivityGridProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No regional data available.</p>;
  }

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {data.map((item) => {
        const intensity = item.count / max;
        return (
          <div
            key={item.region}
            className="admin-card overflow-hidden p-4"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--admin-accent) ${Math.round(intensity * 18)}%, var(--admin-bg-elevated)), var(--admin-bg-elevated))`,
            }}
          >
            <p className="font-heading text-sm font-semibold">{item.region}</p>
            <p className="admin-metric-value mt-1 text-xl text-[var(--admin-accent)]">
              {item.count}
            </p>
            <p className="text-xs text-[var(--admin-muted)]">active listings</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[var(--admin-primary)] transition-all"
                style={{ width: `${intensity * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
