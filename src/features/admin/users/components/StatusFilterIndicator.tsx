import { CheckCircle2, XCircle } from 'lucide-react';
import type { UserStatusFilter } from '../hooks/useAdminUsers';

interface StatusFilterIndicatorProps {
  status: UserStatusFilter;
}

export default function StatusFilterIndicator({ status }: StatusFilterIndicatorProps) {
  if (status === 'active') {
    return <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />;
  }

  if (status === 'blocked') {
    return <XCircle className="h-4 w-4 text-red-600" aria-hidden />;
  }

  if (status === 'deleted') {
    return <XCircle className="h-4 w-4 text-gray-400" aria-hidden />;
  }

  return <CheckCircle2 className="h-4 w-4 text-[#014AB3]" aria-hidden />;
}
