import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CursorPaginationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  summary?: string;
  className?: string;
  isLoading?: boolean;
}

export default function CursorPagination({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  summary,
  className,
  isLoading = false,
}: CursorPaginationProps) {
  if (!hasPrevious && !hasNext && !summary) return null;

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      {summary && <p className="text-muted-foreground text-sm">{summary}</p>}

      <div className="flex items-center gap-2 sm:ml-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPrevious || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
