'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/page-header';
import { ListingStatusBadge } from '@/components/admin/listing-status-badge';
import { ProduceCategoryBadge } from '@/components/admin/produce-category-badge';
import { VerificationBadge } from '@/components/admin/verification-badge';
import { ConfirmationDialog } from '@/components/admin/confirmation-dialog';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAdminListing, useRegenerateMatches, useUpdateListingStatus } from '@/features/admin/hooks/use-admin-listings';
import { formatGhs } from '@/lib/formatters/currency';
import { formatAdminDate } from '@/lib/formatters/dates';
import { ADMIN_ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function AdminListingDetailScreen() {
  const listingId = useParams<{ id: string }>().id;
  const { data: listing, isLoading, isError, refetch } = useAdminListing(listingId);
  const updateStatus = useUpdateListingStatus();
  const regenerate = useRegenerateMatches();
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !listing) return <ErrorState title="Listing not found" onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={listing.title}
        description={`${listing.town}, ${listing.district}, ${listing.region}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={regenerate.isPending} onClick={async () => {
              const res = await regenerate.mutateAsync(listing.id);
              toast.success(`Generated ${res.matchesGenerated} matches`);
            }}>
              Regenerate matches
            </Button>
            {listing.status !== 'CANCELLED' && (
              <Button variant="destructive" onClick={() => setCancelOpen(true)}>Cancel listing</Button>
            )}
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <ListingStatusBadge status={listing.status} />
        {listing.category && <ProduceCategoryBadge category={listing.category.name} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">Supply details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{listing.description}</p>
            <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{listing.availableQuantity} / {listing.quantity} {listing.unit}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span>{listing.pricePerUnit ? formatGhs(listing.pricePerUnit) : '—'} per {listing.unit}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Harvest</span><span>{formatAdminDate(listing.harvestDate)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Available until</span><span>{formatAdminDate(listing.availableUntil)}</span></div>
            {listing.aiExtractionConfidence != null && (
              <div className="flex justify-between"><span className="text-muted-foreground">AI confidence</span><span>{listing.aiExtractionConfidence}%</span></div>
            )}
          </CardContent>
        </Card>
        {listing.farmer && (
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Farmer</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-medium">{listing.farmer.farmName}</p>
              <p>{listing.farmer.town}, {listing.farmer.region}</p>
              <VerificationBadge status={listing.farmer.verificationStatus} />
            </CardContent>
          </Card>
        )}
      </div>

      <Button variant="outline" asChild><Link href={ADMIN_ROUTES.listings}>Back to listings</Link></Button>

      <ConfirmationDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this listing?"
        description="The listing will be removed from the marketplace. This cannot be undone."
        requireReason
        loading={updateStatus.isPending}
        onConfirm={async (reason) => {
          await updateStatus.mutateAsync({ listingId: listing.id, status: 'CANCELLED' });
          toast.success(reason ? `Cancelled — ${reason}` : 'Listing cancelled');
          setCancelOpen(false);
        }}
      />
    </div>
  );
}
