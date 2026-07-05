'use client';

import { AdminLoginForm } from '@/features/auth/components/AdminLoginForm';
import { useAuth } from '@/hooks/use-auth';
import { isAdminUser } from '@/lib/auth/admin-auth';
import { ADMIN_ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Activity, Shield } from 'lucide-react';
import { AfuoPortalMark } from '@/components/brand/AfuoPortalMark';
import { BRAND_NAME } from '@/constants/brand';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated || !user) return;
    if (isAdminUser(user)) {
      router.replace(ADMIN_ROUTES.home);
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative flex flex-col justify-between overflow-hidden px-5 py-10 sm:px-10 lg:px-12">
        <div className="absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="admin-contour" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 20h40M20 0v40" stroke="currentColor" strokeWidth="0.5" className="text-[var(--admin-accent)]" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#admin-contour)" />
          </svg>
        </div>
        <AfuoPortalMark
          variant="admin"
          useFullLogo
          subtitle="Harvest Intelligence Command Centre"
        />
        <div className="relative my-10 space-y-6">
          <h1 className="font-heading max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
            Oversee Ghana&apos;s agricultural marketplace with precision.
          </h1>
          <p className="max-w-lg text-lg text-[var(--admin-muted)]">
            Monitor listings, matches, transactions, and platform health from a single command centre built for {BRAND_NAME} administrators.
          </p>
          <ul className="flex flex-wrap gap-3 text-sm">
            {[
              { label: 'Real-time health', icon: Activity },
              { label: 'Role-protected access', icon: Shield },
            ].map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-3 py-2">
                <Icon className="size-4 text-[var(--admin-accent)]" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-[var(--admin-muted)]">Administrator access only · All actions are audit-logged</p>
      </section>

      <section className="flex items-center border-t border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-5 py-10 sm:px-8 lg:border-l lg:border-t-0">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Sign in to command centre</h2>
            <p className="mt-2 text-sm text-[var(--admin-muted)]">Use your administrator credentials.</p>
          </div>
          <AdminLoginForm onSuccess={() => router.replace(ADMIN_ROUTES.home)} />
        </div>
      </section>
    </div>
  );
}
