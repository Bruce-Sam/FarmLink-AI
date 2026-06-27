'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminPageHeader } from '@/components/admin/page-header';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { notificationsApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatters/dates';
import { queryKeys } from '@/lib/query/keys';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function AdminNotificationsScreen() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.notifications.list({ audience: 'admin' }),
    queryFn: notificationsApi.getNotifications,
  });

  const markAllRead = async () => {
    await notificationsApi.markAllNotificationsRead();
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        description="Platform alerts and system events for administrators."
        actions={
          <Button variant="outline" size="sm" onClick={() => void markAllRead()}>
            Mark all read
          </Button>
        }
      />
      {query.isLoading ? <LoadingSkeleton variant="list" count={5} /> : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up." />
      ) : (
        <ul className="space-y-2">
          {query.data?.map((n) => (
            <li key={n.id} className="admin-card flex items-start gap-3 p-4">
              {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--admin-primary)]" aria-hidden />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                <time className="mt-2 block text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
