import { useQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';

export type AdminReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';

export interface AdminReservation {
  id: string;
  short_code: string;
  status: AdminReservationStatus;
  quantity: number;
  total_price: number;
  created_at: string;
  user_profiles?: {
    id: string;
    full_name: string | null;
    phone: string | null;
  } | null;
  inventory?: {
    pharmacy_profiles?: {
      id: string;
      pharmacy_name: string | null;
      address: string | null;
      phone: string | null;
      city: string | null;
    } | null;
    drugs?: {
      id: string;
      brand_name: string | null;
      brand_name_ar: string | null;
      active_ingredient: string | null;
    } | null;
  } | null;
}

interface RecentReservationsResponse {
  items: AdminReservation[];
  nextCursor: string | null;
}

export function useRecentReservations(limit = 5) {
  return useQuery({
    queryKey: ['admin', 'reservations', 'recent', limit],
    queryFn: async () =>
      (await api.get<RecentReservationsResponse>(ENDPOINTS.ADMIN_RESERVATIONS, {
        params: { limit },
      })) as unknown as RecentReservationsResponse,
  });
}
