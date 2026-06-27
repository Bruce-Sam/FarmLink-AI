import type { AdminAuditLog } from '@/types/admin';
import { formatRelativeTime } from '@/lib/formatters/dates';
import { cn } from '@/lib/utils';
import {
  ClipboardList,
  Handshake,
  Shield,
  Sparkles,
  User,
  type LucideIcon,
} from 'lucide-react';

const actionIcons: Record<string, LucideIcon> = {
  LISTING_PUBLISHED: ClipboardList,
  OFFER_CREATED: Handshake,
  MATCH_GENERATED: Sparkles,
  USER_VERIFIED: Shield,
  default: User,
};

function getIcon(action: string): LucideIcon {
  return actionIcons[action] ?? actionIcons.default;
}

function formatAction(action: string): string {
  return action
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface ActivityTimelineProps {
  activities: AdminAuditLog[];
  className?: string;
  limit?: number;
}

export function ActivityTimeline({ activities, className, limit }: ActivityTimelineProps) {
  const items = limit ? activities.slice(0, limit) : activities;

  if (items.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>No recent activity recorded.</p>
    );
  }

  return (
    <ol className={cn('relative space-y-0', className)}>
      {items.map((item, index) => {
        const Icon = getIcon(item.action);
        const meta = item.metadata as Record<string, unknown> | null;
        const detail =
          (meta?.title as string) ??
          (meta?.amount != null ? `GH₵ ${meta.amount}` : null) ??
          item.entityType;

        return (
          <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < items.length - 1 && (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border"
                aria-hidden
              />
            )}
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-[var(--admin-bg-elevated)] text-[var(--admin-accent)]">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-foreground">{formatAction(item.action)}</p>
              {detail && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{detail}</p>
              )}
              <time className="mt-1 block text-xs text-muted-foreground">
                {formatRelativeTime(item.createdAt)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
