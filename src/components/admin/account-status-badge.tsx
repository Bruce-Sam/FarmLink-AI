import type { AdminAccountStatus } from '@/types/admin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const config: Record<AdminAccountStatus, { label: string; variant: 'leaf' | 'harvest' | 'destructive' }> = {
  ACTIVE: { label: 'Active', variant: 'leaf' },
  SUSPENDED: { label: 'Suspended', variant: 'harvest' },
  DEACTIVATED: { label: 'Deactivated', variant: 'destructive' },
};

interface AccountStatusBadgeProps {
  status: AdminAccountStatus;
  className?: string;
}

export function AccountStatusBadge({ status, className }: AccountStatusBadgeProps) {
  const { label, variant } = config[status] ?? config.ACTIVE;
  return (
    <Badge variant={variant} className={cn(className)}>
      {label}
    </Badge>
  );
}
