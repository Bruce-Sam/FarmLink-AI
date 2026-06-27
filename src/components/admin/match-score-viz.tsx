import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface MatchScoreBreakdown {
  produceScore: number;
  quantityScore: number;
  distanceScore: number;
  dateScore: number;
  priceScore: number;
}

interface MatchScoreVizProps {
  score: number;
  breakdown?: MatchScoreBreakdown;
  className?: string;
}

const breakdownLabels: Array<{ key: keyof MatchScoreBreakdown; label: string }> = [
  { key: 'produceScore', label: 'Produce fit' },
  { key: 'quantityScore', label: 'Quantity' },
  { key: 'distanceScore', label: 'Distance' },
  { key: 'dateScore', label: 'Timing' },
  { key: 'priceScore', label: 'Price' },
];

function scoreColor(score: number): string {
  if (score >= 85) return 'text-farm-green';
  if (score >= 70) return 'text-leaf-green';
  if (score >= 50) return 'text-harvest-gold';
  return 'text-clay-orange';
}

export function MatchScoreViz({ score, breakdown, className }: MatchScoreVizProps) {
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="admin-label">Match score</p>
          <p className={cn('admin-metric-value text-3xl', scoreColor(clamped))}>
            {clamped.toFixed(0)}%
          </p>
        </div>
        <Progress value={clamped} className="h-2 max-w-[12rem] flex-1" />
      </div>
      {breakdown && (
        <div className="grid gap-2 sm:grid-cols-2">
          {breakdownLabels.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn('font-medium tabular-nums', scoreColor(breakdown[key]))}>
                  {breakdown[key]}%
                </span>
              </div>
              <Progress value={breakdown[key]} className="h-1.5" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
