import { useQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import { mapAdminPharmacy, normalizeListResponse } from '@/lib/api-response';
import type { AdminPharmacy } from '@/features/admin/types/admin.types';

export function usePendingPharmacies() {
  return useQuery<AdminPharmacy[]>({
    queryKey: ['pending-pharmacies'],
    queryFn: async () => {
      const data = await api.get(ENDPOINTS.ADMIN_PHARMACIES, {
        params: { status: 'pending' },
      });

      return normalizeListResponse<Record<string, unknown>>(data).map(mapAdminPharmacy);
    },
    refetchInterval: 60 * 1000,
  });
}
