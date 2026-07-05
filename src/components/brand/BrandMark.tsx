import { BrandLogoFull, BrandMarkIcon } from '@/components/brand/BrandMarkIcon';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  variant?: 'icon' | 'full';
}

const sizeMap = {
  sm: { icon: 36, full: 200 },
  md: { icon: 44, full: 260 },
  lg: { icon: 52, full: 300 },
};

export function BrandMark({
  className,
  size = 'md',
  showWordmark = true,
  variant = 'full',
}: BrandMarkProps) {
  const sizes = sizeMap[size];

  if (variant === 'full' && showWordmark) {
    return (
      <div className={cn('inline-flex', className)}>
        <BrandLogoFull width={sizes.full} tone="warm" />
      </div>
    );
  }

  if (!showWordmark) {
    return (
      <div className={cn('inline-flex', className)}>
        <BrandMarkIcon size={sizes.icon} />
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <BrandMarkIcon size={sizes.icon} />
    </div>
  );
}
