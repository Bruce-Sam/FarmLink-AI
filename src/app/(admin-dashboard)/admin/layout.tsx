import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminRoleGuard } from '@/features/auth/components/AdminRoleGuard';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: 'Admin',
};

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminRoleGuard>
      <AdminShell>{children}</AdminShell>
    </AdminRoleGuard>
  );
}
