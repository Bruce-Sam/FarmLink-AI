'use client';

import { useMemo } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { MockDataIndicator } from '@/components/admin/mock-data-indicator';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAdminTransport } from '@/features/admin/hooks/use-admin-transport';
import { formatRelativeTime } from '@/lib/formatters/dates';
import type { AdminTransportSuggestion } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminTransportScreen() {
  const query = useAdminTransport();

  const columns = useMemo<ColumnDef<AdminTransportSuggestion>[]>(
    () => [
      { id: 'primary', header: 'Primary listing', cell: ({ row }) => row.original.primaryTitle },
      { id: 'secondary', header: 'Secondary listing', cell: ({ row }) => row.original.secondaryTitle },
      { id: 'farmers', header: 'Farmers', cell: ({ row }) => `${row.original.primaryFarmer} + ${row.original.secondaryFarmer}` },
      { id: 'distance', header: 'Distance', cell: ({ row }) => `${row.original.distanceBetweenFarmsKm.toFixed(1)} km` },
      { id: 'savings', header: 'Est. savings', cell: ({ row }) => row.original.estimatedSavingsPercentage != null ? `${row.original.estimatedSavingsPercentage}%` : '—' },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant="harvest">{row.original.status}</Badge> },
      { accessorKey: 'createdAt', header: 'Suggested', cell: ({ row }) => formatRelativeTime(row.original.createdAt) },
    ],
    [],
  );

  const table = useReactTable({ data: query.data ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Transport suggestions"
        description="AI-generated route consolidation opportunities between nearby farmer listings."
        actions={<MockDataIndicator label="Mock transport data" />}
      />
      {query.isLoading ? <Skeleton className="h-64 w-full" /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : (query.data?.length ?? 0) === 0 ? (
        <EmptyState title="No transport suggestions" description="Suggestions appear when compatible listings share delivery corridors." />
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
