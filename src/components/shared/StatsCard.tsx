import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  label: string;
  value: string | number;
  hint?: string;
  hintClassName?: string;
  icon: ReactNode;
  iconClassName?: string;
}

export default function StatsCard({
  label,
  value,
  hint,
  hintClassName,
  icon,
  iconClassName,
}: StatsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 py-4">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {hint && (
            <p className={cn('mt-1 text-xs', hintClassName ?? 'text-muted-foreground')}>
              {hint}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            iconClassName ?? 'bg-[#014AB3]/10 text-[#014AB3]'
          )}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
