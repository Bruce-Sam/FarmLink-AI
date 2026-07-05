import { AfuoPortalMark } from '@/components/brand/AfuoPortalMark';
import { cn } from '@/lib/utils';

interface BuyerPortalMarkProps {
  className?: string;
  compact?: boolean;
}

export function BuyerPortalMark({ className, compact = false }: BuyerPortalMarkProps) {
  return (
    <AfuoPortalMark
      className={cn(className)}
      compact={compact}
      useFullLogo={!compact}
      subtitle={compact ? undefined : 'Buyer portal · Harvest Exchange'}
      variant="market"
      tone="market"
    />
  );
}
