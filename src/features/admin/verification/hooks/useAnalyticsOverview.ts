import { useQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { AnalyticsOverview } from '@/features/admin/types/admin.types';

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ['admin-analytics-overview'],
    queryFn: () => api.get(ENDPOINTS.ADMIN_ANALYTICS_OVERVIEW),
    retry: false,
  });
}
