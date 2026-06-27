'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, LogOut, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';

const routeLabels: Record<string, string> = {
  admin: 'Command Centre',
  farmers: 'Farmers',
  buyers: 'Buyers',
  listings: 'Listings',
  demands: 'Demands',
  matches: 'Matches',
  offers: 'Offers',
  transactions: 'Transactions',
  'transport-suggestions': 'Transport',
  analytics: 'Analytics',
  'regional-activity': 'Regional activity',
  notifications: 'Notifications',
  'audit-logs': 'Audit logs',
  settings: 'Settings',
};

interface AppHeaderProps {
  onSearchOpen?: () => void;
  className?: string;
}

export function AppHeader({ onSearchOpen, className }: AppHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationsApi.getUnreadNotificationCount,
  });

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: routeLabels[seg] ?? seg.replace(/-/g, ' '),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]/95 backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between gap-4 px-4 pl-14 lg:pl-6">
        <nav aria-label="Breadcrumb" className="hidden min-w-0 sm:block">
          <ol className="flex flex-wrap items-center gap-1 text-sm">
            {crumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-1">
                {crumb.href !== crumbs[0]?.href && (
                  <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
                )}
                {crumb.isLast ? (
                  <span className="truncate font-medium capitalize text-[var(--admin-ink)]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="truncate capitalize text-muted-foreground hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden gap-2 sm:flex"
            onClick={onSearchOpen}
          >
            <Search className="size-4" aria-hidden />
            <span>Search</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">Ctrl K</kbd>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="sm:hidden"
            onClick={onSearchOpen}
            aria-label="Open search"
          >
            <Search className="size-5" />
          </Button>

          <Button variant="ghost" size="icon-sm" asChild className="relative">
            <Link href={ADMIN_ROUTES.notifications} aria-label="Notifications">
              <Bell className="size-5" />
              {(notificationsQuery.data ?? 0) > 0 && (
                <span className="absolute right-1 top-1 size-2 rounded-full bg-[var(--admin-primary)]" />
              )}
            </Link>
          </Button>

          <div className="hidden items-center gap-2 border-l border-border pl-2 sm:flex">
            <span className="flex size-8 items-center justify-center rounded-full bg-[var(--admin-accent)]/15 text-[var(--admin-accent)]">
              <User className="size-4" aria-hidden />
            </span>
            <div className="hidden max-w-[10rem] md:block">
              <p className="truncate text-sm font-medium">{user?.fullName ?? 'Administrator'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={logout}
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
