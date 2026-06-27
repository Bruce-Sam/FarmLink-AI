import type { AdminListingStatus } from '@/types/admin';
import { Badge } from '@/components/ui/badge';

const config: Record<
  AdminListingStatus,
  { label: string; variant: 'default' | 'leaf' | 'harvest' | 'clay' | 'destructive' | 'muted' | 'outline' }
> = {
  DRAFT: { label: 'Draft', variant: 'muted' },
  PUBLISHED: { label: 'Published', variant: 'leaf' },
  PARTIALLY_RESERVED: { label: 'Partially reserved', variant: 'harvest' },
  RESERVED: { label: 'Reserved', variant: 'clay' },
  SOLD: { label: 'Sold', variant: 'default' },
  EXPIRED: { label: 'Expired', variant: 'outline' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

interface ListingStatusBadgeProps {
  status: AdminListingStatus;
  className?: string;
}

export function ListingStatusBadge({ status, className }: ListingStatusBadgeProps) {
  const { label, variant } = config[status] ?? { label: status, variant: 'outline' as const };
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
