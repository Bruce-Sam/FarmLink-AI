'use client';

import { Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { config } from '@/lib/config';

interface MockDataIndicatorProps {
  className?: string;
  label?: string;
}

export function MockDataIndicator({
  className,
  label = 'Mock data — backend endpoint not available',
}: MockDataIndicatorProps) {
  if (!config.useMockData && !config.isDemoMode) return null;

  return (
    <Badge
      variant="harvest"
      className={cn('gap-1.5 font-normal', className)}
    >
      <Database className="size-3" aria-hidden />
      {label}
    </Badge>
  );
}
