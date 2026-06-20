import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import api from '@/core/api/axios'
import { ENDPOINTS } from '@/core/api/endpoints'

function getErrorMessage(error: unknown) {
  return typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message: unknown }).message)
    : 'Something went wrong. Please try again.'
}

type RejectPharmacyInput = {
  pharmacyId: string
  reason?: string
  rejection_reason?: string
}

export function useRejectPharmacy(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pharmacyId, reason, rejection_reason }: RejectPharmacyInput) =>
      api.post(ENDPOINTS.ADMIN_PHARMACY_REJECT(pharmacyId), {
        rejection_reason: rejection_reason ?? reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pharmacies'] })
      toast.success('Pharmacy rejected successfully')
      onSuccess?.()
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
