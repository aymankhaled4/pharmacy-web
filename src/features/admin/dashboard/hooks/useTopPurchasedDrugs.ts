import { useQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';

export interface TopPurchasedDrug {
  drug_id?: string;
  id?: string;
  brand_name?: string;
  name?: string;
  drug_name?: string;
  brand_name_ar?: string | null;
  active_ingredient?: string;
  total_purchased?: number;
  total_orders?: number;
  total_requested?: number;
  total_requests?: number;
  request_count?: number;
  requested_count?: number;
  count?: number;
}

export function useTopPurchasedDrugs(limit = 5) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'drugs', 'purchased', limit],
    queryFn: async () =>
      (await api.get<TopPurchasedDrug[]>(ENDPOINTS.ADMIN_ANALYTICS_PURCHASED, {
        params: { limit },
      })) as unknown as TopPurchasedDrug[],
  });
}
