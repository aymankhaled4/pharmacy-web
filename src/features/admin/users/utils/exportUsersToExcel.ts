import * as XLSX from 'xlsx';
import { formatDateTime, formatRoleLabel } from '@/lib/format';
import type { AdminUser } from '@/features/admin/types/admin.types';

function formatStatus(status: AdminUser['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function exportUsersToExcel(users: AdminUser[], filename?: string) {
  const rows = users.map((user) => ({
    'Full Name': user.full_name,
    Email: user.email || '',
    Role: formatRoleLabel(user.role),
    Phone: user.phone || '',
    Status: formatStatus(user.status),
    'Last Login': user.last_login ? formatDateTime(user.last_login) : '',
    'Created At': formatDateTime(user.created_at),
    'User ID': user.id,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

  if (rows.length > 0) {
    const headers = Object.keys(rows[0]) as Array<keyof (typeof rows)[0]>;
    worksheet['!cols'] = headers.map((header) => ({
      wch:
        Math.max(
          header.length,
          ...rows.map((row) => String(row[header] ?? '').length)
        ) + 2,
    }));
  }

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, filename ?? `dawak-users-${date}.xlsx`);
}
