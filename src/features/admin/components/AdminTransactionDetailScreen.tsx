'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/page-header';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAdminTransactions } from '@/features/admin/hooks/use-admin-transactions';
import { formatGhs } from '@/lib/formatters/currency';
import { formatAdminDate, formatAdminDateTime } from '@/lib/formatters/dates';
import { ADMIN_ROUTES } from '@/constants/routes';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminTransactionDetailScreen() {
  const transactionId = useParams<{ id: string }>().id;
  const query = useAdminTransactions({ page: 1, limit: 100 });
  const transaction = query.data?.transactions.find((t) => t.id === transactionId);

  if (query.isLoading) return <Skeleton className="h-96 w-full" />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  if (!transaction) return <ErrorState title="Transaction not found" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Transaction detail" description={transaction.listing?.title ?? 'Confirmed deal'} />
      <Badge variant={transaction.status === 'COMPLETED' ? 'leaf' : 'harvest'}>{transaction.status}</Badge>
      <Card className="admin-card">
        <CardHeader><CardTitle className="text-base">Deal summary</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Buyer</span><span>{transaction.buyer?.businessName ?? transaction.buyerId}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{transaction.agreedQuantity} {transaction.unit}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Unit price</span><span>{formatGhs(transaction.agreedPricePerUnit)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total value</span><span className="font-semibold">{formatGhs(transaction.totalAmount)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Pickup</span><span>{formatAdminDate(transaction.pickupDate)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatAdminDateTime(transaction.createdAt)}</span></div>
          {transaction.completedAt && <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span>{formatAdminDateTime(transaction.completedAt)}</span></div>}
        </CardContent>
      </Card>
      <Button variant="outline" asChild><Link href={ADMIN_ROUTES.transactions}>Back to transactions</Link></Button>
    </div>
  );
}
