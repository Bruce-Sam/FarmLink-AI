'use client';

import { useState, type ReactNode } from 'react';
import { AppHeader } from '@/components/admin/app-header';
import { AppSidebar } from '@/components/admin/app-sidebar';
import { CommandSearch } from '@/components/admin/command-search';
import { MockDataIndicator } from '@/components/admin/mock-data-indicator';
import { config } from '@/lib/config';
import { cn } from '@/lib/utils';

interface AdminShellProps {
  children: ReactNode;
  className?: string;
}

export function AdminShell({ children, className }: AdminShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={cn('admin-surface admin-contour-bg min-h-dvh', className)}>
      <div className="lg:flex">
        <AppSidebar mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          <AppHeader onSearchOpen={() => setSearchOpen(true)} />
          {(config.useMockData || config.isDemoMode) && (
            <div className="border-b border-[var(--admin-border)] px-4 py-2">
              <MockDataIndicator />
            </div>
          )}
          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
