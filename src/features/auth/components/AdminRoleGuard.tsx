'use client';

import { useAuth } from '@/hooks/use-auth';
import { isAdminUser } from '@/lib/auth/admin-auth';
import { ADMIN_ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface AdminRoleGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

export function AdminRoleGuard({
  children,
  fallbackPath = ADMIN_ROUTES.login,
}: AdminRoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(fallbackPath);
      return;
    }
    if (!isAdminUser(user)) {
      router.replace(fallbackPath);
    }
  }, [user, loading, router, fallbackPath]);

  if (loading || !user || !isAdminUser(user)) {
    return null;
  }

  return <>{children}</>;
}
