import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { AddInventoryPayload, InventoryItem } from '../types/inventory.types';

export function useAddInventory() {
    const queryClient = useQueryClient();

    return useMutation<InventoryItem, string, AddInventoryPayload>({
        mutationFn: (payload) => api.post(ENDPOINTS.PHARMACY_INVENTORY, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Item added successfully');
        },
        onError: (err) => {
            toast.error(typeof err === 'string' ? err : 'Failed to add item');
        },
    });
}
