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

export function AdminFarmerDetailScreen() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { data: user, isLoading, isError, refetch } = useAdminUser(userId);
  const updateStatus = useUpdateUserStatus();
  const [suspendOpen, setSuspendOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !user) {
    return <ErrorState title="Farmer not found" onRetry={() => void refetch()} />;
  }

  const profile = user.farmerProfile;

  const handleSuspend = async (reason?: string) => {
    try {
      await updateStatus.mutateAsync({
        userId: user.id,
        status: user.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED',
      });
      toast.success(reason ? `Status updated — ${reason}` : 'Account status updated');
      setSuspendOpen(false);
    } catch {
      toast.error('Could not update account status');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={user.fullName}
        description={profile?.farmName ?? 'Farmer account'}
        actions={
          <Button
            variant={user.accountStatus === 'SUSPENDED' ? 'outline' : 'destructive'}
            onClick={() => setSuspendOpen(true)}
          >
            {user.accountStatus === 'SUSPENDED' ? 'Reactivate account' : 'Suspend account'}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><AccountStatusBadge status={user.accountStatus} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{user.phoneNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{user.email ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{formatAdminDate(user.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last login</span><span>{user.lastLoginAt ? formatAdminDateTime(user.lastLoginAt) : '—'}</span></div>
          </CardContent>
        </Card>

        {profile && (
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">Farm profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Verification</span><VerificationBadge status={profile.verificationStatus} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{profile.town}, {profile.district}, {profile.region}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Farm size</span><span>{profile.farmSizeAcres ? `${profile.farmSizeAcres} acres` : '—'}</span></div>
              <div><span className="text-muted-foreground">Primary crops</span><p className="mt-1">{profile.primaryCrops.join(', ') || '—'}</p></div>
              {profile.description && <p className="text-muted-foreground">{profile.description}</p>}
            </CardContent>
          </Card>
        )}
      </div>

      <Button variant="outline" asChild>
        <Link href={ADMIN_ROUTES.farmers}>Back to farmers</Link>
      </Button>

      <ConfirmationDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        title={user.accountStatus === 'SUSPENDED' ? 'Reactivate farmer?' : 'Suspend farmer account?'}
        description="This action is recorded in the audit log and affects marketplace access immediately."
        requireReason
        confirmLabel={user.accountStatus === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
        loading={updateStatus.isPending}
        onConfirm={handleSuspend}
      />
    </div>
  );
}
