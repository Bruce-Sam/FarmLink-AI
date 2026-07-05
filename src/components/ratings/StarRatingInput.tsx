'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function StarRatingInput({ value, onChange, disabled, className }: StarRatingInputProps) {
  return (
    <div className={cn('inline-flex items-center gap-1', className)} role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }, (_, index) => {
        const score = index + 1;
        const active = score <= value;
        return (
          <button
            key={score}
            type="button"
            disabled={disabled}
            role="radio"
            aria-checked={value === score}
            aria-label={`${score} star${score === 1 ? '' : 's'}`}
            onClick={() => onChange(score)}
            className="rounded p-0.5 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star
              className={cn(
                'size-7',
                active ? 'fill-harvest-gold text-harvest-gold' : 'text-muted-foreground/40',
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
