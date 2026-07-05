'use client';

import { StarRatingDisplay } from '@/components/ratings/StarRatingDisplay';
import type { RatingSummary } from '@/types/rating';
import { cn } from '@/lib/utils';

interface RatingSummaryCardProps {
  summary: RatingSummary;
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function RatingSummaryCard({
  summary,
  title = 'Partner ratings',
  emptyMessage = 'No ratings yet — complete a transaction to receive your first review.',
  className,
}: RatingSummaryCardProps) {
  const hasRatings = summary.totalRatings > 0;

  return (
    <section className={cn('rounded-2xl border border-morning-mist bg-warm-paper p-5', className)}>
      <h2 className="font-heading text-lg font-semibold">{title}</h2>

      {hasRatings ? (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StarRatingDisplay score={summary.averageScore} size="md" />
            <p className="text-sm text-muted-text">
              {summary.totalRatings} review{summary.totalRatings === 1 ? '' : 's'}
            </p>
          </div>

          {summary.recentRatings.length > 0 && (
            <ul className="space-y-3 border-t border-morning-mist pt-4">
              {summary.recentRatings.map((rating) => (
                <li key={rating.id} className="space-y-1 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{rating.raterName ?? 'Partner'}</span>
                    <StarRatingDisplay score={rating.score} size="sm" showValue={false} />
                  </div>
                  {rating.comment && (
                    <p className="text-muted-text">&ldquo;{rating.comment}&rdquo;</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-text">{emptyMessage}</p>
      )}
    </section>
  );
}
