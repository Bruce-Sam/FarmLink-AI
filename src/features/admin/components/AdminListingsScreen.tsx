'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { ListingStatusBadge } from '@/components/admin/listing-status-badge';
import { ProduceCategoryBadge } from '@/components/admin/produce-category-badge';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAdminListings } from '@/features/admin/hooks/use-admin-listings';
import { AdminPagination } from '@/features/admin/components/AdminPagination';
import { formatGhs } from '@/lib/formatters/currency';
import { formatAdminDate } from '@/lib/formatters/dates';
import { ADMIN_ROUTES } from '@/constants/routes';
import type { AdminListing } from '@/types/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminListingsScreen() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const query = useAdminListings({ page, limit: 20, status: status === 'all' ? undefined : status as AdminListing['status'] });

  const columns = useMemo<ColumnDef<AdminListing>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Listing',
        cell: ({ row }) => (
          <Link href={ADMIN_ROUTES.listingDetail(row.original.id)} className="font-medium text-[var(--admin-accent)] hover:underline">
            {row.original.title}
          </Link>
        ),
      },
      { id: 'category', header: 'Category', cell: ({ row }) => row.original.category ? <ProduceCategoryBadge category={row.original.category.name} /> : '—' },
      { id: 'farmer', header: 'Farmer', cell: ({ row }) => row.original.farmer?.farmName ?? '—' },
      { id: 'region', header: 'Region', cell: ({ row }) => row.original.region },
      { id: 'qty', header: 'Available', cell: ({ row }) => `${row.original.availableQuantity} ${row.original.unit}` },
      { id: 'price', header: 'Price', cell: ({ row }) => row.original.pricePerUnit ? `${formatGhs(row.original.pricePerUnit)}/${row.original.unit}` : '—' },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <ListingStatusBadge status={row.original.status} /> },
      { accessorKey: 'publishedAt', header: 'Published', cell: ({ row }) => formatAdminDate(row.original.publishedAt) },
    ],
    [],
  );

  const table = useReactTable({ data: query.data?.listings ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Listings" description="All produce listings across the marketplace with status and pricing." />
      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Filter status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="PUBLISHED">Published</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="SOLD">Sold</SelectItem>
          <SelectItem value="EXPIRED">Expired</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      {query.isLoading ? <Skeleton className="h-64 w-full" /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : (query.data?.listings.length ?? 0) === 0 ? (
        <EmptyState title="No listings" />
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
