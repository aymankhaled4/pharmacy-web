import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import { getApiErrorMessage } from '@/lib/api-error';

interface RejectPharmacyPayload {
  pharmacyId: string;
  rejection_reason: string;
}

export function useRejectPharmacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pharmacyId, rejection_reason }: RejectPharmacyPayload) =>
      api.post(ENDPOINTS.ADMIN_PHARMACY_REJECT(pharmacyId), { rejection_reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics-overview'] });
      toast.success('Pharmacy rejected');
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Failed to reject pharmacy');
      if (message.toLowerCase().includes('rejected')) {
        toast.error('This pharmacy is already rejected');
        return;
      }
      toast.error(message);
    },
  });
}
