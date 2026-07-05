import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListingPhotoGalleryProps {
  images: string[];
  title: string;
  className?: string;
  /** Compact thumbnail for cards and list rows. */
  variant?: 'gallery' | 'thumbnail';
}

export function ListingPhotoGallery({
  images,
  title,
  className,
  variant = 'gallery',
}: ListingPhotoGalleryProps) {
  if (images.length === 0) {
    if (variant === 'thumbnail') {
      return (
        <div
          className={cn(
            'flex size-20 shrink-0 items-center justify-center rounded-xl border border-soft-border bg-produce-cream/50 text-ledger-grey dark:bg-deep-grove/30',
            className,
          )}
          aria-hidden
        >
          <ImageIcon className="size-6 opacity-50" />
        </div>
      );
    }
    return null;
  }

  if (variant === 'thumbnail') {
    return (
      <div className={cn('relative size-20 shrink-0 overflow-hidden rounded-xl border border-soft-border', className)}>
        <Image src={images[0]} alt={title} fill unoptimized className="object-cover" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <p className="exchange-label">Photos</p>
      <div
        className={cn(
          'grid gap-2',
          images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3',
        )}
      >
        {images.map((src, index) => (
          <div
            key={`${index}-${src.slice(0, 32)}`}
            className="relative aspect-[4/3] overflow-hidden rounded-xl border border-soft-border bg-produce-cream/30"
          >
            <Image
              src={src}
              alt={`${title} — photo ${index + 1}`}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
