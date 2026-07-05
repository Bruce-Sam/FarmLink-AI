'use client';

import type { AdminAnalytics } from '@/types/admin';
import { cn } from '@/lib/utils';

interface AdminFunnelPanelProps {
  funnel: AdminAnalytics['funnel'];
}

const steps = [
  { key: 'publishedListings', label: 'Published listings', rateKey: null },
  { key: 'totalMatches', label: 'Matches generated', rateKey: 'listingToMatch' },
  { key: 'offersSent', label: 'Offers sent', rateKey: 'matchToOffer' },
  { key: 'offersAccepted', label: 'Offers accepted', rateKey: 'offerToAccept' },
  { key: 'completedTransactions', label: 'Completed deals', rateKey: 'acceptToComplete' },
] as const;

export function AdminFunnelPanel({ funnel }: AdminFunnelPanelProps) {
  const max = funnel.publishedListings || 1;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Marketplace funnel — how supply moves from listings to closed deals. Active buyer demands:{' '}
        <strong className="text-foreground">{funnel.activeDemands}</strong>
      </p>
      <ol className="space-y-3">
        {steps.map((step, index) => {
          const value = funnel[step.key as keyof typeof funnel] as number;
          const width = Math.max(12, Math.round((value / max) * 100));
          const rate =
            step.rateKey != null
              ? funnel.conversionRates[step.rateKey as keyof typeof funnel.conversionRates]
              : null;

          return (
            <li key={step.key}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="font-medium">{step.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {value.toLocaleString()}
                  {rate != null && ` · ${rate}% step conversion`}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    index === steps.length - 1 ? 'bg-[var(--admin-accent)]' : 'bg-[var(--admin-primary)]',
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
