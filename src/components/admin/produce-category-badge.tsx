import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProduceCategoryBadgeProps {
  category: string;
  className?: string;
}

export function ProduceCategoryBadge({ category, className }: ProduceCategoryBadgeProps) {
  return (
    <Badge variant="leaf" className={cn('font-medium', className)}>
      {category}
    </Badge>
  );
}
