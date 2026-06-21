import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';

export function useDeleteInventory() {
    const queryClient = useQueryClient();

    return useMutation<void, string, string>({
        mutationFn: (id) => api.delete(ENDPOINTS.PHARMACY_INVENTORY_BY_ID(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Item removed from inventory');
        },
        onError: (err) => {
            toast.error(typeof err === 'string' ? err : 'Failed to remove item');
        },
    });
}
