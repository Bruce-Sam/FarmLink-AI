import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingDisplayProps {
  score: number;
  max?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}

export function StarRatingDisplay({
  score,
  max = 5,
  size = 'md',
  showValue = true,
  className,
}: StarRatingDisplayProps) {
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4';
  const rounded = Math.round(score * 2) / 2;

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      aria-label={`Rating ${score.toFixed(1)} out of ${max}`}
    >
      <div className="inline-flex items-center">
        {Array.from({ length: max }, (_, index) => {
          const value = index + 1;
          const filled = rounded >= value;
          const half = !filled && rounded >= value - 0.5;
          return (
            <Star
              key={value}
              className={cn(
                iconSize,
                filled || half
                  ? 'fill-harvest-gold text-harvest-gold'
                  : 'fill-transparent text-muted-foreground/40',
              )}
              aria-hidden
            />
          );
        })}
      </div>
      {showValue && (
        <span className={cn('tabular-nums text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {score.toFixed(1)}
        </span>
      )}
    </div>
  );
}
