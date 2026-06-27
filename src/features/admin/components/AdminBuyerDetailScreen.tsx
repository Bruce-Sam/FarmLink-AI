'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/page-header';
import { VerificationBadge } from '@/components/admin/verification-badge';
import { AccountStatusBadge } from '@/components/admin/account-status-badge';
import { ConfirmationDialog } from '@/components/admin/confirmation-dialog';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAdminUser, useUpdateUserStatus } from '@/features/admin/hooks/use-admin-users';
import { formatAdminDate, formatAdminDateTime } from '@/lib/formatters/dates';
import { ADMIN_ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function AdminBuyerDetailScreen() {
  const userId = useParams<{ id: string }>().id;
  const { data: user, isLoading, isError, refetch } = useAdminUser(userId);
  const updateStatus = useUpdateUserStatus();
  const [dialogOpen, setDialogOpen] = useState(false);
  const profile = user?.buyerProfile;

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !user) return <ErrorState title="Buyer not found" onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={profile?.businessName ?? user.fullName}
        description={`Buyer · ${user.fullName}`}
        actions={
          <Button variant={user.accountStatus === 'SUSPENDED' ? 'outline' : 'destructive'} onClick={() => setDialogOpen(true)}>
            {user.accountStatus === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><AccountStatusBadge status={user.accountStatus} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span>{user.phoneNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{user.email ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{formatAdminDate(user.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last login</span><span>{user.lastLoginAt ? formatAdminDateTime(user.lastLoginAt) : '—'}</span></div>
          </CardContent>
        </Card>
        {profile && (
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Business profile</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Verification</span><VerificationBadge status={profile.verificationStatus} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{profile.buyerType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{profile.town}, {profile.region}</span></div>
              <div><span className="text-muted-foreground">Preferred produce</span><p className="mt-1">{profile.preferredProduce.join(', ') || '—'}</p></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Max travel</span><span>{profile.maximumTravelDistanceKm} km</span></div>
            </CardContent>
          </Card>
        )}
      </div>
      <Button variant="outline" asChild><Link href={ADMIN_ROUTES.buyers}>Back to buyers</Link></Button>
      <ConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={user.accountStatus === 'SUSPENDED' ? 'Reactivate buyer?' : 'Suspend buyer account?'}
        description="Buyer marketplace access will be affected immediately."
        requireReason
        loading={updateStatus.isPending}
        onConfirm={async (reason) => {
          await updateStatus.mutateAsync({ userId: user.id, status: user.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' });
          toast.success(reason ? `Updated — ${reason}` : 'Status updated');
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
