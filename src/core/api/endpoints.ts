export const ENDPOINTS = {
  // Auth
  AUTH_ROLE: '/auth/role',

  // Pharmacy
  PHARMACY_ME: '/pharmacy/me',
  PHARMACY_INVENTORY: '/pharmacy/inventory',
  PHARMACY_INVENTORY_BY_ID: (id: string) => `/pharmacy/inventory/${id}`,
  PHARMACY_INVENTORY_DISCOUNT: (id: string) => `/pharmacy/inventory/${id}/discount`,
  PHARMACY_INVENTORY_NEAR_EXPIRY: '/pharmacy/inventory/near-expiry',
  PHARMACY_INVENTORY_IMPORT: '/pharmacy/inventory/import',
  PHARMACY_INVENTORY_IMPORT_STATUS: (jobId: string) => `/pharmacy/inventory/import/${jobId}`,
  PHARMACY_RESERVATIONS: '/pharmacy/reservations',
  PHARMACY_RESERVATION_BY_ID: (id: string) => `/pharmacy/reservations/${id}`,
  PHARMACY_PICKUP: '/pharmacy/pickup',
  PHARMACY_REGISTER: '/pharmacy/register',

  // Notifications
  NOTIFICATIONS_ME: '/notifications/me',
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',

  // Admin
  ADMIN_PHARMACIES: '/admin/pharmacies',
  ADMIN_PHARMACY_APPROVE: (id: string) => `/admin/pharmacies/${id}/approve`,
  ADMIN_PHARMACY_REJECT: (id: string) => `/admin/pharmacies/${id}/reject`,
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_BY_ID: (id: string) => `/admin/users/${id}`,
  ADMIN_USER_ACTIVE: (id: string) => `/admin/users/${id}/active`,
  ADMIN_USER_INACTIVE: (id: string) => `/admin/users/${id}/inactive`,
  ADMIN_USERS_BULK_ACTIVE: '/admin/users/bulk/active',
  ADMIN_USERS_BULK_INACTIVE: '/admin/users/bulk/inactive',
  ADMIN_RESERVATIONS: '/admin/reservations',
  ADMIN_ANALYTICS_OVERVIEW: '/admin/analytics/overview',
  ADMIN_ANALYTICS_SEARCHED: '/admin/analytics/drugs/searched',
  ADMIN_ANALYTICS_PURCHASED: '/admin/analytics/drugs/purchased',
} as const;