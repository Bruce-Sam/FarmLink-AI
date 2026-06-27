'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Brain, Database, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { queryKeys } from '@/lib/query/keys';
import { healthApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface StatusDotProps {
  ok: boolean;
  label: string;
  detail?: string;
}

function StatusDot({ ok, label, detail }: StatusDotProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={cn(
          'size-2 rounded-full',
          ok ? 'bg-leaf-green shadow-[0_0_6px_var(--leaf-green)]' : 'bg-tomato-red',
        )}
        aria-hidden
      />
      <span className="font-medium text-[var(--admin-nav-fg)]">{label}</span>
      {detail && <span className="text-[var(--admin-nav-muted)]">{detail}</span>}
    </div>
  );
}

export function StatusRail({ className }: { className?: string }) {
  const healthQuery = useQuery({
    queryKey: queryKeys.admin.health(),
    queryFn: async () => {
      const [api, root] = await Promise.allSettled([
        healthApi.getApiHealth(),
        healthApi.getRootHealth(),
      ]);
      return {
        api: api.status === 'fulfilled' ? api.value : null,
        root: root.status === 'fulfilled' ? root.value : null,
      };
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  if (healthQuery.isLoading) {
    return (
      <div className={cn('flex flex-wrap gap-4 px-4 py-2', className)}>
        <Skeleton className="h-4 w-20 bg-white/10" />
        <Skeleton className="h-4 w-20 bg-white/10" />
        <Skeleton className="h-4 w-20 bg-white/10" />
      </div>
    );
  }

  const apiOk = healthQuery.data?.api?.success ?? false;
  const dbOk = healthQuery.data?.api?.database?.connected ?? false;
  const aiOk = healthQuery.data?.root?.success ?? apiOk;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/10 px-4 py-2',
        className,
      )}
      role="status"
      aria-label="Platform health"
    >
      <StatusDot ok={apiOk} label="API" detail={apiOk ? 'Online' : 'Unreachable'} />
      <StatusDot
        ok={dbOk}
        label="Database"
        detail={dbOk ? 'Connected' : 'Unknown'}
      />
      <StatusDot ok={aiOk} label="AI services" detail={aiOk ? 'Ready' : 'Degraded'} />
      <div className="ml-auto hidden items-center gap-3 text-[var(--admin-nav-muted)] sm:flex">
        <Server className="size-3.5" aria-hidden />
        <Database className="size-3.5" aria-hidden />
        <Brain className="size-3.5" aria-hidden />
        <Activity className="size-3.5" aria-hidden />
      </div>
    </div>
  );
}
