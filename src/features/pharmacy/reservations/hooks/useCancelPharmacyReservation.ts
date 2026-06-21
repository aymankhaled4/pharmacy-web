import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/core/api/axios'
import { toast } from 'sonner'

export function useCancelPharmacyReservation(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reservationId: string) => api.delete(`/pharmacy/reservations/${reservationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-reservations'] })
      toast.success('The reservation has been successfully cancelled')
      onSuccess?.()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(message || 'An error occurred while cancelling the reservation')
    },
  })
}
