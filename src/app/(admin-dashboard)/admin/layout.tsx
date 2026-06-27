'use client';

import type { ReactNode } from 'react';
import { AdminRoleGuard } from '@/features/auth/components/AdminRoleGuard';
import { AdminShell } from '@/components/admin/admin-shell';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminRoleGuard>
      <AdminShell>{children}</AdminShell>
    </AdminRoleGuard>
  );
}
