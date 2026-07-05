import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BrandLogoTone = 'light' | 'warm' | 'white' | 'admin' | 'market' | 'none';

const toneStyles: Record<Exclude<BrandLogoTone, 'none'>, string> = {
  light:
    'bg-gradient-to-br from-white via-warm-paper to-field-cream border border-morning-mist/90 shadow-sm',
  warm:
    'bg-gradient-to-b from-white to-field-cream border border-farm-green/15 shadow-[0_8px_24px_-12px_rgba(27,77,46,0.35)]',
  white: 'bg-white shadow-md ring-1 ring-black/5',
  market:
    'bg-gradient-to-br from-produce-cream to-white border border-market-green/15 shadow-sm dark:from-deep-grove/40 dark:to-exchange-ink/60 dark:border-market-green/20',
  admin:
    'bg-[var(--admin-bg-elevated)] border border-[var(--admin-border)] shadow-sm',
};

interface BrandLogoFrameProps {
  children: ReactNode;
  tone?: BrandLogoTone;
  /** Rounded container shape. */
  shape?: 'rounded' | 'pill' | 'circle';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const paddingStyles = {
  none: '',
  xs: 'p-1.5',
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4 sm:p-5',
};

const shapeStyles = {
  rounded: 'rounded-2xl',
  pill: 'rounded-full',
  circle: 'rounded-full aspect-square flex items-center justify-center',
};

/** Gives transparent PNG logos a deliberate surface on each portal. */
export function BrandLogoFrame({
  children,
  tone = 'warm',
  shape = 'rounded',
  padding = 'md',
  className,
}: BrandLogoFrameProps) {
  if (tone === 'none') {
    return <div className={cn('inline-flex', className)}>{children}</div>;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        toneStyles[tone],
        shapeStyles[shape],
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
