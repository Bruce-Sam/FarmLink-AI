'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { MockDataIndicator } from '@/components/admin/mock-data-indicator';
import { ProduceCategoryBadge } from '@/components/admin/produce-category-badge';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAdminDemands } from '@/features/admin/hooks/use-admin-demands';
import { formatGhs } from '@/lib/formatters/currency';
import { formatAdminDate } from '@/lib/formatters/dates';
import { ADMIN_ROUTES } from '@/constants/routes';
import type { AdminDemand } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminDemandsScreen() {
  const query = useAdminDemands();

  const columns = useMemo<ColumnDef<AdminDemand>[]>(
    () => [
      { accessorKey: 'buyerName', header: 'Buyer', cell: ({ row }) => <Link href={ADMIN_ROUTES.buyerDetail(row.original.buyerId)} className="text-[var(--admin-accent)] hover:underline">{row.original.buyerName}</Link> },
      { id: 'category', header: 'Category', cell: ({ row }) => <ProduceCategoryBadge category={row.original.categoryName} /> },
      { id: 'qty', header: 'Quantity', cell: ({ row }) => `${row.original.minimumQuantity}${row.original.maximumQuantity ? `–${row.original.maximumQuantity}` : '+'} ${row.original.unit}` },
      { id: 'price', header: 'Max price', cell: ({ row }) => row.original.preferredPriceMaximum ? formatGhs(row.original.preferredPriceMaximum) : '—' },
      { id: 'regions', header: 'Regions', cell: ({ row }) => row.original.preferredRegions.join(', ') || 'Any' },
      { id: 'active', header: 'Active', cell: ({ row }) => <Badge variant={row.original.isActive ? 'leaf' : 'muted'}>{row.original.isActive ? 'Active' : 'Inactive'}</Badge> },
      { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => formatAdminDate(row.original.createdAt) },
    ],
    [],
  );

  const table = useReactTable({ data: query.data ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Buyer demands"
        description="Procurement requirements posted by buyers — used for match generation."
        actions={<MockDataIndicator />}
      />
      {query.isLoading ? <Skeleton className="h-64 w-full" /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : (query.data?.length ?? 0) === 0 ? (
        <EmptyState title="No demands recorded" />
      ) : (
        <div className="admin-card overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>{table.getHeaderGroups().map((hg) => (<TableRow key={hg.id}>{hg.headers.map((h) => (<TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
            <TableBody>{table.getRowModel().rows.map((row) => (<TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))}</TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
