import type { CursorListResult } from '@/core/types/api.types';
import type { UserAccountStatus, UserManagementRole } from '@/core/types/common.types';

const LIST_KEYS = ['items', 'users', 'pharmacies', 'results', 'records', 'data'] as const;

export function normalizeListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];

  const record = data as Record<string, unknown>;

  for (const key of LIST_KEYS) {
    const value = record[key];
    if (Array.isArray(value)) return value as T[];
  }

  return [];
}

export function extractCursorListResult<T>(data: unknown): CursorListResult<T> {
  const items = normalizeListResponse<T>(data);

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { items, nextCursor: null };
  }

  const record = data as Record<string, unknown>;
  const nextCursor =
    typeof record.nextCursor === 'string'
      ? record.nextCursor
      : typeof record.next_cursor === 'string'
        ? record.next_cursor
        : null;

  return { items, nextCursor };
}

function resolveUserStatus(raw: Record<string, unknown>): UserAccountStatus {
  const status = raw.status;
  if (status === 'active' || status === 'blocked' || status === 'deleted') {
    return status;
  }
  if (raw.deleted_at) return 'deleted';
  return 'active';
}

function resolveUserRole(raw: Record<string, unknown>): UserManagementRole {
  return raw.role === 'admin' ? 'admin' : 'user';
}

export function mapAdminUser(raw: Record<string, unknown>) {
  return {
    id: String(raw.id ?? ''),
    full_name: String(raw.full_name ?? raw.name ?? raw.display_name ?? 'Unknown User'),
    email: String(raw.email ?? ''),
    phone:
      typeof raw.phone === 'string' && raw.phone.trim() ? raw.phone : null,
    role: resolveUserRole(raw),
    status: resolveUserStatus(raw),
    last_login:
      typeof raw.last_login === 'string'
        ? raw.last_login
        : raw.last_login == null
          ? null
          : null,
    created_at: String(raw.created_at ?? new Date().toISOString()),
    deleted_at:
      typeof raw.deleted_at === 'string'
        ? raw.deleted_at
        : raw.deleted_at == null
          ? null
          : null,
  };
}

export function mapAdminPharmacy(raw: Record<string, unknown>) {
  return {
    id: String(raw.id ?? ''),
    pharmacy_name: String(raw.pharmacy_name ?? raw.name ?? 'Unknown Pharmacy'),
    license_number: String(raw.license_number ?? ''),
    phone: String(raw.phone ?? ''),
    address: String(raw.address ?? ''),
    city: String(raw.city ?? ''),
    status: (raw.status as 'pending' | 'approved' | 'rejected') ?? 'pending',
    rejection_reason:
      typeof raw.rejection_reason === 'string' ? raw.rejection_reason : null,
    created_at: String(raw.created_at ?? new Date().toISOString()),
  };
}
