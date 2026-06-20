import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/core/api/axios'
import { toast } from 'sonner'

export function useConfirmPickup(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (shortCode: string) => api.post('/pharmacy/pickup', { shortCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-reservations'] })
      toast.success('Successful receipt confirmed')
      onSuccess?.()
    },
    onError: (error: unknown) => {
      let message = 'Incorrect pickup code or the reservation is not pending'
      if (typeof error === 'string') {
        message = error
      } else if (typeof error === 'object' && error !== null) {
        const e = error as Record<string, unknown>
        if (typeof e.message === 'string') message = e.message
        else if (typeof e.code === 'string') message = e.code
      }
      toast.error(message)
    },
  })
}