import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between', className)}>
      <div>
        {breadcrumbs && (
          <p className="text-muted-foreground mb-2 text-xs">{breadcrumbs}</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
