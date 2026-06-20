import { useQuery } from '@tanstack/react-query'
import api from '@/core/api/axios'
import type { PharmacyReservation, ReservationStatus } from '../types'

export function usePharmacyReservations(status?: ReservationStatus | 'all') {
  return useQuery<PharmacyReservation[]>({
    queryKey: ['pharmacy-reservations', status ?? 'all'],
    queryFn: async () => {
      const params = status && status !== 'all' ? { status } : {}
      return api.get('/pharmacy/reservations', { params })
    },
    refetchInterval: 30_000,
  })
}