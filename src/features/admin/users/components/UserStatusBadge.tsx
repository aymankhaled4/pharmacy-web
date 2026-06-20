import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserAccountStatus } from '@/core/types/common.types';

interface UserStatusBadgeProps {
  status: UserAccountStatus;
}

const statusConfig: Record<
  UserAccountStatus,
  { label: string; className: string; dotClassName: string }
> = {
  active: {
    label: 'Active',
    className: 'border-green-200 bg-green-50 text-green-700',
    dotClassName: 'bg-green-500',
  },
  blocked: {
    label: 'Blocked',
    className: 'border-red-200 bg-red-50 text-red-700',
    dotClassName: 'bg-red-500',
  },
  deleted: {
    label: 'Deleted',
    className: 'border-gray-200 bg-gray-100 text-gray-600',
    dotClassName: 'bg-gray-400',
  },
};

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 rounded-md px-2.5 py-0.5 font-medium', config.className)}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClassName)} />
      {config.label}
    </Badge>
  );
}
