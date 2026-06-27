'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAdminOffers } from '@/features/admin/hooks/use-admin-offers';
import { AdminPagination } from '@/features/admin/components/AdminPagination';
import { formatGhs } from '@/lib/formatters/currency';
import { formatAdminDate } from '@/lib/formatters/dates';
import { ADMIN_ROUTES } from '@/constants/routes';
import type { AdminOffer } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminOffersScreen() {
  const [page, setPage] = useState(1);
  const query = useAdminOffers({ page, limit: 20 });

  const columns = useMemo<ColumnDef<AdminOffer>[]>(
    () => [
      { id: 'listing', header: 'Listing', cell: ({ row }) => <Link href={ADMIN_ROUTES.offerDetail(row.original.id)} className="font-medium text-[var(--admin-accent)] hover:underline">{row.original.listing?.title ?? row.original.listingId}</Link> },
      { id: 'buyer', header: 'Buyer', cell: ({ row }) => row.original.buyer?.businessName ?? '—' },
      { id: 'qty', header: 'Quantity', cell: ({ row }) => `${row.original.offeredQuantity} ${row.original.unit}` },
      { id: 'total', header: 'Total', cell: ({ row }) => formatGhs(row.original.totalAmount) },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'PENDING' ? 'harvest' : row.original.status === 'ACCEPTED' ? 'leaf' : 'muted'}>{row.original.status}</Badge> },
      { accessorKey: 'proposedPickupDate', header: 'Pickup', cell: ({ row }) => formatAdminDate(row.original.proposedPickupDate) },
    ],
    [],
  );

  const table = useReactTable({ data: query.data?.offers ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Offers" description="Buyer offers on farmer listings across the marketplace." />
      {query.isLoading ? <Skeleton className="h-64 w-full" /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : (query.data?.offers.length ?? 0) === 0 ? (
        <EmptyState title="No offers" />
      ) : (
        <>
          <div className="admin-card overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>{table.getHeaderGroups().map((hg) => (<TableRow key={hg.id}>{hg.headers.map((h) => (<TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
              <TableBody>{table.getRowModel().rows.map((row) => (<TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))}</TableBody>
            </Table>
          </div>
          <AdminPagination meta={query.data?.meta ?? null} page={page} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
