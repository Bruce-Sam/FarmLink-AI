import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProduceCategoryBadge } from '@/components/admin/produce-category-badge';

interface MarketplacePulseProps {
  byCategory: Array<{ categoryId: string; category: string; count: number }>;
  byRegion: Array<{ region: string; count: number }>;
  className?: string;
}

export function MarketplacePulse({ byCategory, byRegion, className }: MarketplacePulseProps) {
  const topCategory = byCategory[0];
  const topRegion = byRegion[0];
  const categoryTotal = byCategory.reduce((s, c) => s + c.count, 0) || 1;

  return (
    <div className={cn('grid gap-4 lg:grid-cols-2', className)}>
      <Card className="admin-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Produce mix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topCategory && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Leading category</span>
              <ProduceCategoryBadge category={topCategory.category} />
            </div>
          )}
          <ul className="space-y-2">
            {byCategory.slice(0, 5).map((item) => (
              <li key={item.categoryId} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">{item.category}</span>
                <span className="tabular-nums text-muted-foreground">{item.count}</span>
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-[var(--admin-accent)]"
                    style={{ width: `${(item.count / categoryTotal) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="admin-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Regional supply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topRegion && (
            <p className="text-sm">
              <span className="text-muted-foreground">Most active: </span>
              <span className="font-medium">{topRegion.region}</span>
              <span className="ml-2 tabular-nums text-[var(--admin-primary)]">
                {topRegion.count} listings
              </span>
            </p>
          )}
          <ul className="space-y-2">
            {byRegion.slice(0, 5).map((item) => (
              <li
                key={item.region}
                className="flex justify-between border-b border-border/60 pb-2 text-sm last:border-0"
              >
                <span>{item.region}</span>
                <span className="font-medium tabular-nums">{item.count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
