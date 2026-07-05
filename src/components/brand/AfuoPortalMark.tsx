import { BrandLogoFull, BrandMarkIcon } from '@/components/brand/BrandMarkIcon';
import type { BrandLogoTone } from '@/components/brand/BrandLogoFrame';
import { BRAND_TAGLINE, BRAND_NAME } from '@/constants/brand';
import { cn } from '@/lib/utils';

interface AfuoPortalMarkProps {
  subtitle?: string;
  compact?: boolean;
  className?: string;
  /** Admin command centre uses a darker shell. */
  variant?: 'default' | 'admin' | 'market';
  /** Use full wordmark instead of icon (recommended for main headers). */
  useFullLogo?: boolean;
  /** Override logo surface tone. */
  tone?: BrandLogoTone;
}

export function AfuoPortalMark({
  subtitle,
  compact = false,
  className,
  variant = 'default',
  useFullLogo = false,
  tone,
}: AfuoPortalMarkProps) {
  const logoTone: BrandLogoTone =
    tone ?? (variant === 'admin' ? 'admin' : variant === 'market' ? 'market' : 'warm');

  if (useFullLogo && !compact) {
    return (
      <div className={cn('inline-flex w-full max-w-sm flex-col gap-2', className)}>
        <BrandLogoFull
          width={variant === 'admin' ? 260 : 300}
          tone={logoTone}
          priority
          padding={variant === 'admin' ? 'md' : 'lg'}
        />
        {(subtitle ?? (variant !== 'admin' ? BRAND_TAGLINE : undefined)) && (
          <p
            className={cn(
              'text-center text-xs font-medium uppercase tracking-wide sm:text-left',
              variant === 'admin'
                ? 'text-[var(--admin-nav-muted)]'
                : 'text-muted-foreground',
            )}
          >
            {subtitle ?? BRAND_TAGLINE}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center', className)}>
      <BrandMarkIcon
        size={compact ? 36 : 44}
        tone={logoTone}
        framed
      />
      {!compact && subtitle && (
        <span
          className={cn(
            'sr-only',
          )}
        >
          {subtitle}
        </span>
      )}
      {compact && <span className="sr-only">{BRAND_NAME}</span>}
    </div>
  );
}
