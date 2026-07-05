import Image from 'next/image';
import { BrandLogoFrame, type BrandLogoTone } from '@/components/brand/BrandLogoFrame';
import { BRAND_LOGO_FULL, BRAND_LOGO_ICON, BRAND_NAME } from '@/constants/brand';
import { cn } from '@/lib/utils';

interface BrandMarkIconProps {
  size?: number;
  className?: string;
  framed?: boolean;
  tone?: BrandLogoTone;
}

/** Compact Afuo Market icon for sidebars, favicons, and tight layouts. */
export function BrandMarkIcon({
  size = 44,
  className,
  framed = true,
  tone = 'light',
}: BrandMarkIconProps) {
  const image = (
    <Image
      src={BRAND_LOGO_ICON}
      alt=""
      width={size}
      height={size}
      className={cn('shrink-0 object-contain', className)}
      aria-hidden
      priority
    />
  );

  if (!framed) return image;

  return (
    <BrandLogoFrame tone={tone} shape="rounded" padding="xs" className="shrink-0">
      {image}
    </BrandLogoFrame>
  );
}

interface BrandLogoFullProps {
  /** Max render width — height follows the square source asset. */
  width?: number;
  className?: string;
  priority?: boolean;
  framed?: boolean;
  tone?: BrandLogoTone;
  padding?: 'sm' | 'md' | 'lg';
}

/** Full Afuo Market wordmark for headers, login pages, and marketing surfaces. */
export function BrandLogoFull({
  width = 280,
  className,
  priority = false,
  framed = true,
  tone = 'warm',
  padding = 'lg',
}: BrandLogoFullProps) {
  const image = (
    <Image
      src={BRAND_LOGO_FULL}
      alt={BRAND_NAME}
      width={width}
      height={width}
      className={cn('h-auto w-full max-w-full object-contain', className)}
      style={{ maxWidth: width }}
      priority={priority}
    />
  );

  if (!framed) return image;

  return (
    <BrandLogoFrame tone={tone} padding={padding} className="w-full max-w-[min(100%,320px)]">
      {image}
    </BrandLogoFrame>
  );
}
