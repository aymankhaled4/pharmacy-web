import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRoleLabel } from '@/lib/format';
import type { UserManagementRole } from '@/core/types/common.types';

interface UserRoleBadgeProps {
  role: UserManagementRole;
  className?: string;
}

export default function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-md px-2.5 py-0.5 font-medium',
        role === 'admin' && 'border-[#014AB3]/20 bg-[#014AB3]/10 text-[#014AB3]',
        role === 'user' && 'border-gray-200 bg-gray-50 text-gray-700',
        className
      )}
    >
      {formatRoleLabel(role)}
    </Badge>
  );
}
