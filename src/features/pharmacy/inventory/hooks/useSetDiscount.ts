import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';

interface SetDiscountPayload {
    discount_percent: number;
}

export function useSetDiscount() {
    const queryClient = useQueryClient();

    return useMutation<void, string, { id: string; discount_percent: number }>({
        mutationFn: ({ id, discount_percent }) =>
            api.patch(ENDPOINTS.PHARMACY_INVENTORY_DISCOUNT(id), { discount_percent } as SetDiscountPayload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'], refetchType: 'all' });
            toast.success('Discount applied successfully');
        },
        onError: (err) => {
            toast.error(typeof err === 'string' ? err : 'Failed to apply discount');
        },
    });
}
