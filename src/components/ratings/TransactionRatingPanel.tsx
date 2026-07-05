'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { StarRatingDisplay } from '@/components/ratings/StarRatingDisplay';
import { StarRatingInput } from '@/components/ratings/StarRatingInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ratingsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import type { RatedRole } from '@/types/rating';
import type { TransactionStatus } from '@/types/transaction';

const RATEABLE_STATUSES: TransactionStatus[] = ['delivered', 'completed'];

interface TransactionRatingPanelProps {
  transactionId: string;
  status: TransactionStatus;
  portal: 'farmer' | 'buyer';
  counterpartyName?: string;
}

function targetLabel(role: RatedRole): string {
  return role === 'farmer' ? 'farmer' : 'buyer';
}

export function TransactionRatingPanel({
  transactionId,
  status,
  portal,
  counterpartyName,
}: TransactionRatingPanelProps) {
  const queryClient = useQueryClient();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  const canShowPanel = RATEABLE_STATUSES.includes(status);

  const ratingsQuery = useQuery({
    queryKey: queryKeys.ratings.transaction(transactionId),
    queryFn: () => ratingsApi.getTransactionRatings(transactionId),
    enabled: canShowPanel,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      ratingsApi.submitRating({
        transactionId,
        targetRole: ratingsQuery.data!.targetRole,
        score,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Rating submitted');
      void queryClient.invalidateQueries({
        queryKey: queryKeys.ratings.transaction(transactionId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ratings.all });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? 'Could not submit rating');
    },
  });

  if (!canShowPanel) return null;

  if (ratingsQuery.isLoading) {
    return (
      <section className="mt-6 rounded-2xl border border-morning-mist bg-warm-paper p-5">
        <p className="text-sm text-muted-text">Loading ratings…</p>
      </section>
    );
  }

  const context = ratingsQuery.data;
  if (!context) return null;

  const partnerLabel = counterpartyName ?? targetLabel(context.targetRole);

  if (context.myRating) {
    return (
      <section className="mt-6 rounded-2xl border border-morning-mist bg-warm-paper p-5">
        <h2 className="font-heading text-lg font-semibold">Your rating</h2>
        <p className="mt-1 text-sm text-muted-text">
          You rated {partnerLabel} on this transaction.
        </p>
        <div className="mt-3">
          <StarRatingDisplay score={context.myRating.score} />
        </div>
        {context.myRating.comment && (
          <p className="mt-3 text-sm text-muted-text">&ldquo;{context.myRating.comment}&rdquo;</p>
        )}
      </section>
    );
  }

  if (!context.canRate) return null;

  return (
    <section className="mt-6 rounded-2xl border border-farm-green/30 bg-farm-green/5 p-5">
      <h2 className="font-heading text-lg font-semibold">
        Rate this {portal === 'farmer' ? 'buyer' : 'farmer'}
      </h2>
      <p className="mt-1 text-sm text-muted-text">
        Share how your experience went with {partnerLabel}. Ratings help build trust on Afuo Market.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <Label className="text-sm">Your rating</Label>
          <div className="mt-2">
            <StarRatingInput value={score} onChange={setScore} disabled={submitMutation.isPending} />
          </div>
        </div>

        <div>
          <Label htmlFor={`rating-comment-${transactionId}`}>Comment (optional)</Label>
          <Textarea
            id={`rating-comment-${transactionId}`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Was pickup on time? Was produce quality as agreed?"
            rows={3}
            maxLength={500}
            className="mt-2"
            disabled={submitMutation.isPending}
          />
        </div>

        <Button
          onClick={() => submitMutation.mutate()}
          disabled={score < 1 || submitMutation.isPending}
        >
          {submitMutation.isPending ? 'Submitting…' : 'Submit rating'}
        </Button>
      </div>
    </section>
  );
}
