'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/page-header';
import { MatchScoreViz } from '@/components/admin/match-score-viz';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAdminMatches } from '@/features/admin/hooks/use-admin-matches';
import { ADMIN_ROUTES } from '@/constants/routes';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const statusVariant: Record<string, 'leaf' | 'harvest' | 'muted' | 'clay'> = {
  RECOMMENDED: 'leaf',
  VIEWED: 'harvest',
  OFFERED: 'clay',
  CONVERTED: 'leaf',
  DISMISSED: 'muted',
  EXPIRED: 'muted',
};

export function AdminMatchDetailScreen() {
  const matchId = useParams<{ id: string }>().id;
  const query = useAdminMatches({ page: 1, limit: 100 });
  const match = query.data?.matches.find((m) => m.id === matchId);

  if (query.isLoading) return <Skeleton className="h-96 w-full" />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  if (!match) return <ErrorState title="Match not found" message="This match may have expired or been removed." />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Match detail" description={match.explanation} />
      <MatchScoreViz
        score={match.score}
        breakdown={{
          produceScore: match.produceScore,
          quantityScore: match.quantityScore,
          distanceScore: match.distanceScore,
          dateScore: match.dateScore,
          priceScore: match.priceScore,
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2 text-sm">
        <div className="admin-card p-4">
          <p className="admin-label">Listing</p>
          <Link href={ADMIN_ROUTES.listingDetail(match.listingId)} className="font-medium text-[var(--admin-accent)] hover:underline">
            {match.listing?.title ?? match.listingId}
          </Link>
        </div>
        <div className="admin-card p-4">
          <p className="admin-label">Buyer</p>
          <p className="font-medium">{match.buyer?.businessName ?? match.buyerId}</p>
        </div>
      </div>
      <Badge variant={statusVariant[match.status] ?? 'outline'}>{match.status}</Badge>
      <Link href={ADMIN_ROUTES.matches} className="text-sm text-[var(--admin-accent)] hover:underline">← Back to matches</Link>
    </div>
  );
}
