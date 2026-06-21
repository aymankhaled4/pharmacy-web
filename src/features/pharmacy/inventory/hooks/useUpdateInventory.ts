import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { UpdateInventoryPayload, InventoryItem } from '../types/inventory.types';

export function useUpdateInventory() {
    const queryClient = useQueryClient();

    return useMutation<InventoryItem, string, { id: string; payload: UpdateInventoryPayload }>({
        mutationFn: ({ id, payload }) =>
            api.patch(ENDPOINTS.PHARMACY_INVENTORY_BY_ID(id), payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Item updated successfully');
        },
        onError: (err) => {
            toast.error(typeof err === 'string' ? err : 'Failed to update item');
        },
    });
}
