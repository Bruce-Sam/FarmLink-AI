'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const MAX_IMAGES = 3;
const MAX_BYTES = 400_000;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ListingImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  className?: string;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.readAsDataURL(file);
  });
}

export function ListingImageUpload({ value, onChange, className }: ListingImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    const next = [...value];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_IMAGES) break;
      if (!ACCEPTED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_BYTES) continue;

      try {
        const dataUrl = await fileToDataUrl(file);
        next.push(dataUrl);
      } catch {
        // skip unreadable files
      }
    }
    onChange(next.slice(0, MAX_IMAGES));
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label>Photos of your produce</Label>
      <p className="text-xs text-muted-text">
        Add up to {MAX_IMAGES} photos so buyers can see what you are selling (JPEG, PNG, or WebP,
        max 400 KB each).
      </p>

      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {value.map((src, index) => (
            <li key={`${index}-${src.slice(0, 32)}`} className="relative aspect-square overflow-hidden rounded-xl border border-morning-mist">
              <Image
                src={src}
                alt={`Produce photo ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-1 top-1 rounded-full bg-field-ink/70 p-1 text-white"
                aria-label={`Remove photo ${index + 1}`}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.length < MAX_IMAGES && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            className="sr-only"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" aria-hidden />
            {value.length === 0 ? 'Add photos' : 'Add another photo'}
          </Button>
        </>
      )}
    </div>
  );
}
