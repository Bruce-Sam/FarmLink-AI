'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/page-header';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAdminOffers } from '@/features/admin/hooks/use-admin-offers';
import { formatGhs } from '@/lib/formatters/currency';
import { formatAdminDate, formatAdminDateTime } from '@/lib/formatters/dates';
import { ADMIN_ROUTES } from '@/constants/routes';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function AdminOfferDetailScreen() {
  const offerId = useParams<{ id: string }>().id;
  const query = useAdminOffers({ page: 1, limit: 100 });
  const offer = query.data?.offers.find((o) => o.id === offerId);

  if (query.isLoading) return <Skeleton className="h-96 w-full" />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  if (!offer) return <ErrorState title="Offer not found" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Offer detail" description={offer.listing?.title ?? 'Marketplace offer'} />
      <Badge variant={offer.status === 'PENDING' ? 'harvest' : 'leaf'}>{offer.status}</Badge>
      <Card className="admin-card">
        <CardHeader><CardTitle className="text-base">Commercial terms</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{offer.offeredQuantity} {offer.unit}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Price per unit</span><span>{formatGhs(offer.offeredPricePerUnit)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{formatGhs(offer.totalAmount)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Pickup date</span><span>{formatAdminDate(offer.proposedPickupDate)}</span></div>
          {offer.message && <p className="rounded-lg bg-muted/50 p-3 italic">{offer.message}</p>}
          <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatAdminDateTime(offer.createdAt)}</span></div>
        </CardContent>
      </Card>
      <Button variant="outline" asChild><Link href={ADMIN_ROUTES.offers}>Back to offers</Link></Button>
    </div>
  );
}
