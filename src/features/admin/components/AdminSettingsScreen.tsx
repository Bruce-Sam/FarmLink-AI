'use client';

import { AdminPageHeader } from '@/components/admin/page-header';
import { useAdminHealth } from '@/features/admin/hooks/use-admin-health';
import { config } from '@/lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function AdminSettingsScreen() {
  const health = useAdminHealth();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Administrator console configuration and platform connectivity."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">Environment</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">API URL</span><code className="text-xs">{config.apiUrl}</code></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Demo mode</span><Badge variant={config.isDemoMode ? 'harvest' : 'outline'}>{config.isDemoMode ? 'Enabled' : 'Disabled'}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Mock data</span><Badge variant={config.useMockData ? 'harvest' : 'outline'}>{config.useMockData ? 'Enabled' : 'Disabled'}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Environment</span><span>{config.isDevelopment ? 'Development' : 'Production'}</span></div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">Service health</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {health.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">API</span><Badge variant={health.data?.api?.success ? 'leaf' : 'destructive'}>{health.data?.api?.status ?? 'Unknown'}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Database</span><Badge variant={health.data?.api?.database?.connected ? 'leaf' : 'muted'}>{health.data?.api?.database?.connected ? 'Connected' : 'Unknown'}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Root health</span><Badge variant={health.data?.root?.success ? 'leaf' : 'muted'}>{health.data?.root?.status ?? 'Unknown'}</Badge></div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
