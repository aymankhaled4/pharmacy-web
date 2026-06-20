import { useQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import { extractCursorListResult, mapAdminPharmacy } from '@/lib/api-response';
import type { AdminPharmaciesListResult } from '@/features/admin/types/admin.types';

export const PENDING_PHARMACIES_PAGE_SIZE = 5;

interface UsePendingPharmaciesOptions {
  search?: string;
  cursor?: string;
  limit?: number;
}

export function usePendingPharmacies({
  search = '',
  cursor,
  limit = PENDING_PHARMACIES_PAGE_SIZE,
}: UsePendingPharmaciesOptions = {}) {
  const trimmedSearch = search.trim();

  return useQuery<AdminPharmaciesListResult>({
    queryKey: ['pending-pharmacies', trimmedSearch, cursor ?? 'initial', limit],
    queryFn: async () => {
      const data = await api.get(ENDPOINTS.ADMIN_PHARMACIES, {
        params: {
          status: 'pending',
          limit,
          ...(cursor ? { cursor } : {}),
          ...(trimmedSearch ? { search: trimmedSearch } : {}),
        },
      });

      const { items, nextCursor, total } =
        extractCursorListResult<Record<string, unknown>>(data);

      return {
        items: items.map(mapAdminPharmacy),
        nextCursor,
        total: total ?? null,
      };
    },
    refetchInterval: 60 * 1000,
  });
}
