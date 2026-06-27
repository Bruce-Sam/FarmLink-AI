import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  eyebrow = 'Harvest Intelligence',
  actions,
  breadcrumbs,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={cn('space-y-3 pb-6', className)}>
      {breadcrumbs}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="admin-label text-[var(--admin-accent)]">{eyebrow}</p>
          <h1 className="font-heading mt-1 text-2xl font-bold tracking-tight text-[var(--admin-ink)] sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-[var(--admin-muted)] sm:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
