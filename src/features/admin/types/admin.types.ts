import type { PharmacyStatus, UserAccountStatus, UserManagementRole } from '@/core/types/common.types';

export interface AdminPharmacy {
  id: string;
  pharmacy_name: string;
  license_number: string;
  phone: string;
  address: string;
  city: string;
  status: PharmacyStatus;
  rejection_reason: string | null;
  created_at: string;
}

export interface CreateAdminUserPayload {
  email: string;
  password: string;
  full_name: string;
  role?: UserManagementRole;
  phone?: string;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserManagementRole;
  status: UserAccountStatus;
  last_login: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface AdminUsersListResult {
  items: AdminUser[];
  nextCursor: string | null;
}

export interface BulkUserStatusResult {
  success: boolean;
  updated_count: number;
  failed_ids: string[];
  users?: Array<{
    id: string;
    status: UserAccountStatus;
    full_name: string;
  }>;
}

export interface AnalyticsOverview {
  pending_pharmacies?: number;
  todays_approvals?: number;
  recent_rejections?: number;
  avg_review_time_hours?: number;
  approval_rate?: number;
}
