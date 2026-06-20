import { useQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';

export interface AnalyticsOverview {
  users: {
    active: number;
  };
  pharmacies: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  reservations: {
    pending: number;
    confirmed: number;
    cancelled: number;
    expired: number;
    total: number;
  };
  revenue: {
    confirmed_total: number;
  };
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: async () =>
      (await api.get<AnalyticsOverview>(ENDPOINTS.ADMIN_ANALYTICS_OVERVIEW)) as unknown as AnalyticsOverview,
  });
}
