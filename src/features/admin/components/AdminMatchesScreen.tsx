'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAdminMatches } from '@/features/admin/hooks/use-admin-matches';
import { AdminPagination } from '@/features/admin/components/AdminPagination';
import { formatRelativeTime } from '@/lib/formatters/dates';
import { ADMIN_ROUTES } from '@/constants/routes';
import type { AdminMatch } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const statusVariant: Record<string, 'leaf' | 'harvest' | 'muted' | 'clay'> = {
  RECOMMENDED: 'leaf',
  VIEWED: 'harvest',
  OFFERED: 'clay',
  CONVERTED: 'leaf',
  DISMISSED: 'muted',
  EXPIRED: 'muted',
};

export function AdminMatchesScreen() {
  const [page, setPage] = useState(1);
  const query = useAdminMatches({ page, limit: 20 });

  const columns = useMemo<ColumnDef<AdminMatch>[]>(
    () => [
      {
        accessorKey: 'score',
        header: 'Score',
        cell: ({ row }) => (
          <Link href={ADMIN_ROUTES.matchDetail(row.original.id)} className="font-heading font-semibold tabular-nums text-[var(--admin-primary)] hover:underline">
            {row.original.score}%
          </Link>
        ),
      },
      { id: 'listing', header: 'Listing', cell: ({ row }) => row.original.listing?.title ?? row.original.listingId },
      { id: 'buyer', header: 'Buyer', cell: ({ row }) => row.original.buyer?.businessName ?? row.original.buyerId },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={statusVariant[row.original.status] ?? 'outline'}>{row.original.status}</Badge> },
      { accessorKey: 'generatedAt', header: 'Generated', cell: ({ row }) => formatRelativeTime(row.original.generatedAt) },
    ],
    [],
  );

  const table = useReactTable({ data: query.data?.matches ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="AI matches" description="Buyer–listing recommendations ranked by multi-factor match scoring." />
      {query.isLoading ? <Skeleton className="h-64 w-full" /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : (query.data?.matches.length ?? 0) === 0 ? (
        <EmptyState title="No matches yet" description="Matches appear when listings are published and buyer demands align." />
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

