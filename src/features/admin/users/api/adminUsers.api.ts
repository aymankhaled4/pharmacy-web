import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import { extractCursorListResult, mapAdminUser } from '@/lib/api-response';
import type { AdminUser, CreateAdminUserPayload } from '@/features/admin/types/admin.types';
import type {
  UserRoleFilter,
  UserStatusFilter,
} from '@/features/admin/users/hooks/useAdminUsers';

const EXPORT_PAGE_LIMIT = 100;

interface FetchAdminUsersParams {
  status: UserStatusFilter;
  role: UserRoleFilter;
  cursor?: string;
}

export async function fetchAllAdminUsers({
  status,
  role,
}: Omit<FetchAdminUsersParams, 'cursor'>): Promise<AdminUser[]> {
  const allUsers: AdminUser[] = [];
  let cursor: string | undefined;

  do {
    const data = await api.get(ENDPOINTS.ADMIN_USERS, {
      params: {
        limit: EXPORT_PAGE_LIMIT,
        ...(cursor ? { cursor } : {}),
        ...(role !== 'all' ? { role } : {}),
        ...(status !== 'all' ? { status } : {}),
        ...(status === 'all' || status === 'deleted' ? { include_deleted: true } : {}),
      },
    });

    const { items, nextCursor } = extractCursorListResult<Record<string, unknown>>(data);
    allUsers.push(...items.map(mapAdminUser));
    cursor = nextCursor ?? undefined;
  } while (cursor);

  return allUsers;
}

export async function createAdminUser(payload: CreateAdminUserPayload): Promise<AdminUser> {
  const body: CreateAdminUserPayload = {
    email: payload.email.trim(),
    password: payload.password,
    full_name: payload.full_name.trim(),
    role: payload.role ?? 'user',
  };

  if (body.role === 'user' && payload.phone?.trim()) {
    body.phone = payload.phone.trim();
  }

  const data = await api.post(ENDPOINTS.ADMIN_USERS, body);
  return mapAdminUser(data as unknown as Record<string, unknown>);
}
