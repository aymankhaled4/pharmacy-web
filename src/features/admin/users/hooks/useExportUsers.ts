import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchAllAdminUsers } from '../api/adminUsers.api';
import { exportUsersToExcel } from '../utils/exportUsersToExcel';
import { getApiErrorMessage } from '@/lib/api-error';
import type { UserRoleFilter, UserStatusFilter } from './useAdminUsers';

interface ExportUsersParams {
  status: UserStatusFilter;
  role: UserRoleFilter;
  search?: string;
}

function filterUsersBySearch<T extends { full_name: string; email: string; phone: string | null; role: string; id: string }>(
  users: T[],
  search: string
): T[] {
  const query = search.trim().toLowerCase();
  if (!query) return users;

  return users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
  );
}

export function useExportUsers() {
  return useMutation({
    mutationFn: async ({ status, role, search = '' }: ExportUsersParams) => {
      const allUsers = await fetchAllAdminUsers({ status, role });
      const users = filterUsersBySearch(allUsers, search);

      if (users.length === 0) {
        throw new Error('No users match the current filters to export.');
      }

      exportUsersToExcel(users);
      return users.length;
    },
    onSuccess: (count) => {
      toast.success(`Exported ${count} user${count === 1 ? '' : 's'} to Excel`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to export users'));
    },
  });
}
