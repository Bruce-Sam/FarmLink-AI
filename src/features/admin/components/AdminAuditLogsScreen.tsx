'use client';

import { useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { ActivityTimeline } from '@/components/admin/activity-timeline';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAdminAuditLogs } from '@/features/admin/hooks/use-admin-audit-logs';
import { AdminPagination } from '@/features/admin/components/AdminPagination';
import { formatAdminDateTime } from '@/lib/formatters/dates';
import type { AdminAuditLog } from '@/types/admin';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminAuditLogsScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const query = useAdminAuditLogs({ page, limit: 20, search: search || undefined });

  const columns = useMemo<ColumnDef<AdminAuditLog>[]>(
    () => [
      { accessorKey: 'action', header: 'Action' },
      { accessorKey: 'entityType', header: 'Entity' },
      { accessorKey: 'entityId', header: 'Entity ID', cell: ({ row }) => row.original.entityId ?? '—' },
      { accessorKey: 'actorUserId', header: 'Actor', cell: ({ row }) => row.original.actorUserId ?? 'System' },
      { accessorKey: 'createdAt', header: 'When', cell: ({ row }) => formatAdminDateTime(row.original.createdAt) },
    ],
    [],
  );

  const table = useReactTable({ data: query.data?.auditLogs ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Audit logs" description="Immutable record of administrative and platform actions." />
      <Input placeholder="Search actions…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-md" />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {query.isLoading ? <Skeleton className="h-64 w-full lg:col-span-2" /> : query.isError ? (
          <div className="lg:col-span-2"><ErrorState onRetry={() => void query.refetch()} /></div>
        ) : (query.data?.auditLogs.length ?? 0) === 0 ? (
          <div className="lg:col-span-2"><EmptyState title="No audit entries" /></div>
        ) : (
          <>
            <div className="admin-card overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>{table.getHeaderGroups().map((hg) => (<TableRow key={hg.id}>{hg.headers.map((h) => (<TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
                <TableBody>{table.getRowModel().rows.map((row) => (<TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))}</TableBody>
              </Table>
              <div className="p-4"><AdminPagination meta={query.data?.meta ?? null} page={page} onPageChange={setPage} /></div>
            </div>
            <Card className="admin-card">
              <CardHeader><CardTitle className="text-base">Recent timeline</CardTitle></CardHeader>
              <CardContent><ActivityTimeline activities={query.data?.auditLogs ?? []} limit={8} /></CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
