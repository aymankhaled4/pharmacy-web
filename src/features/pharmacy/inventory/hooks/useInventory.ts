import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { InventoryFilters, InventoryPage } from '../types/inventory.types';

export function useInventory(filters: InventoryFilters = {}) {
    const { search = '', status = '', limit = 20 } = filters;

    return useInfiniteQuery<InventoryPage, string>({
        queryKey: ['inventory', search, status, limit],
        initialPageParam: undefined as string | undefined,
        queryFn: ({ pageParam }) =>
            api.get(ENDPOINTS.PHARMACY_INVENTORY, {
                params: {
                    search: search || undefined,
                    status: status || undefined,
                    limit,
                    cursor: pageParam || undefined,
                },
            }),
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
}
