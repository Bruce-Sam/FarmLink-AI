'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { VerificationBadge } from '@/components/admin/verification-badge';
import { AccountStatusBadge } from '@/components/admin/account-status-badge';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAdminUsers } from '@/features/admin/hooks/use-admin-users';
import { AdminPagination } from '@/features/admin/components/AdminPagination';
import { formatAdminDate } from '@/lib/formatters/dates';
import { ADMIN_ROUTES } from '@/constants/routes';
import type { AdminUser } from '@/types/admin';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminBuyersScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const query = useAdminUsers({ page, limit: 20, role: 'BUYER', search: search || undefined });

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Contact',
        cell: ({ row }) => (
          <div>
            <Link href={ADMIN_ROUTES.buyerDetail(row.original.id)} className="font-medium text-[var(--admin-accent)] hover:underline">
              {row.original.fullName}
            </Link>
            <p className="text-xs text-muted-foreground">{row.original.buyerProfile?.businessName ?? '—'}</p>
          </div>
        ),
      },
      { id: 'type', header: 'Type', cell: ({ row }) => row.original.buyerProfile?.buyerType ?? '—' },
      { id: 'region', header: 'Region', cell: ({ row }) => row.original.buyerProfile?.region ?? '—' },
      {
        id: 'verification',
        header: 'Verification',
        cell: ({ row }) => row.original.buyerProfile ? <VerificationBadge status={row.original.buyerProfile.verificationStatus} /> : '—',
      },
      { accessorKey: 'accountStatus', header: 'Status', cell: ({ row }) => <AccountStatusBadge status={row.original.accountStatus} /> },
      { accessorKey: 'createdAt', header: 'Joined', cell: ({ row }) => formatAdminDate(row.original.createdAt) },
    ],
    [],
  );

  const table = useReactTable({ data: query.data?.users ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Buyers" description="Procurement businesses and buyer verification across the platform." />
      <Input placeholder="Search buyers…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-md" />
      {query.isLoading ? <Skeleton className="h-64 w-full" /> : query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : (query.data?.users.length ?? 0) === 0 ? (
        <EmptyState title="No buyers found" />
      ) : (
        <>
          <div className="admin-card overflow-hidden rounded-xl border">
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
