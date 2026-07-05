import { AfuoPortalMark } from '@/components/brand/AfuoPortalMark';
import { cn } from '@/lib/utils';

interface FarmerPortalMarkProps {
  className?: string;
  compact?: boolean;
}

export function FarmerPortalMark({ className, compact = false }: FarmerPortalMarkProps) {
  return (
    <AfuoPortalMark
      className={cn(className)}
      compact={compact}
      useFullLogo={!compact}
      subtitle={compact ? undefined : 'Farmer portal · Field journal'}
      tone="warm"
    />
  );
}
