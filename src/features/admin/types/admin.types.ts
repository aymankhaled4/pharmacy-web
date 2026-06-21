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
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface AdminPharmaciesListResult {
  items: AdminPharmacy[];
  nextCursor: string | null;
  total: number | null;
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
  pending_pharmacies_delta?: number | null;
  pending_pharmacies_delta_label?: string | null;
  todays_approvals?: number;
  recent_rejections?: number;
  avg_review_time_hours?: number;
  approval_rate?: number;
}
