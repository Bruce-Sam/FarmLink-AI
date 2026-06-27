import type { AdminVerificationStatus } from '@/types/admin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, ShieldAlert, ShieldOff } from 'lucide-react';

const config: Record<
  AdminVerificationStatus,
  { label: string; variant: 'leaf' | 'harvest' | 'destructive' | 'muted'; icon: typeof CheckCircle2 }
> = {
  VERIFIED: { label: 'Verified', variant: 'leaf', icon: CheckCircle2 },
  PENDING: { label: 'Pending', variant: 'harvest', icon: Clock },
  UNVERIFIED: { label: 'Unverified', variant: 'muted', icon: ShieldOff },
  REJECTED: { label: 'Rejected', variant: 'destructive', icon: ShieldAlert },
};

interface VerificationBadgeProps {
  status: AdminVerificationStatus;
  className?: string;
  showIcon?: boolean;
}

export function VerificationBadge({ status, className, showIcon = true }: VerificationBadgeProps) {
  const { label, variant, icon: Icon } = config[status] ?? config.UNVERIFIED;
  return (
    <Badge variant={variant} className={cn('gap-1', className)}>
      {showIcon && <Icon className="size-3" aria-hidden />}
      {label}
    </Badge>
  );
}
