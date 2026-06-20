import { useQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';

export interface TopSearchedDrug {
  drug_id?: string;
  resolved_ingredient?: string;
  label?: string;
  brand_name?: string;
  brand_name_ar?: string;
  generic_name?: string;
  active_ingredient?: string;
  category?: string;
  search_count?: number;
  request_count?: number;
  unique_searchers?: number;
  total_quantity?: number;
}

export function useTopSearchedDrugs(limit = 5) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'drugs', 'searched', limit],
    queryFn: async () =>
      (await api.get<TopSearchedDrug[]>(ENDPOINTS.ADMIN_ANALYTICS_SEARCHED, {
        params: { limit },
      })) as unknown as TopSearchedDrug[],
  });
}