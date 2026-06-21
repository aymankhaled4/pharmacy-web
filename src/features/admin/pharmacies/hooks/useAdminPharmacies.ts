import { useQuery } from '@tanstack/react-query'

import api from '@/core/api/axios'
import { ENDPOINTS } from '@/core/api/endpoints'

import type { AdminPharmacy, PharmacyStatus } from '../types'

interface AdminPharmaciesResponse {
  items?: AdminPharmacy[]
  data?: AdminPharmacy[] | AdminPharmaciesResponse
  nextCursor?: string | null
  total?: number
}

function normalizePharmacies(response: unknown): AdminPharmacy[] {
  if (Array.isArray(response)) return response

  if (response && typeof response === 'object') {
    const payload = response as AdminPharmaciesResponse

    if (Array.isArray(payload.items)) return payload.items
    if (Array.isArray(payload.data)) return payload.data
    if (payload.data) return normalizePharmacies(payload.data)
  }

  return []
}

export function useAdminPharmacies(status?: PharmacyStatus | 'all') {
  return useQuery<unknown, Error, AdminPharmacy[]>({
    queryKey: ['admin-pharmacies', status ?? 'all'],
    queryFn: () =>
      api.get(ENDPOINTS.ADMIN_PHARMACIES, {
        params: status && status !== 'all' ? { status } : {},
      }),
    select: normalizePharmacies,
  })
}
