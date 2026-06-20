import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import { getApiErrorMessage } from '@/lib/api-error';

export function useApprovePharmacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pharmacyId: string) =>
      api.post(ENDPOINTS.ADMIN_PHARMACY_APPROVE(pharmacyId), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics-overview'] });
      toast.success('Pharmacy approved successfully');
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Failed to approve pharmacy');
      if (message.toLowerCase().includes('approved')) {
        toast.error('This pharmacy is already approved');
        return;
      }
      toast.error(message);
    },
  });
}