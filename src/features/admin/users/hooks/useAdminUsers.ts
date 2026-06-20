import { useQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import { extractCursorListResult, mapAdminUser } from '@/lib/api-response';
import type { AdminUsersListResult } from '@/features/admin/types/admin.types';
import type { UserAccountStatus } from '@/core/types/common.types';

export type UserStatusFilter = UserAccountStatus | 'all';
export type UserRoleFilter = 'all' | 'user' | 'admin';

const PAGE_LIMIT = 20;

interface UseAdminUsersOptions {
  status?: UserStatusFilter;
  role?: UserRoleFilter;
  cursor?: string;
}

export function useAdminUsers({
  status = 'active',
  role = 'all',
  cursor,
}: UseAdminUsersOptions = {}) {
  return useQuery<AdminUsersListResult>({
    queryKey: ['admin-users', status, role, cursor ?? 'initial'],
    queryFn: async () => {
      const data = await api.get(ENDPOINTS.ADMIN_USERS, {
        params: {
          limit: PAGE_LIMIT,
          ...(cursor ? { cursor } : {}),
          ...(role !== 'all' ? { role } : {}),
          ...(status !== 'all' ? { status } : {}),
          ...(status === 'all' || status === 'deleted' ? { include_deleted: true } : {}),
        },
      });

      const { items, nextCursor } = extractCursorListResult<Record<string, unknown>>(data);

      return {
        items: items.map(mapAdminUser),
        nextCursor,
      };
    },
  });
}
