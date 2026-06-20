import { useQuery } from '@tanstack/react-query';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';

export type ActivityType =
  | 'pharmacy_application'
  | 'pharmacy_approved'
  | 'pharmacy_rejected'
  | 'low_inventory'
  | 'reservation_created'
  | 'reservation_completed'
  | 'reservation_cancelled';

export type ActivitySeverity = 'info' | 'success' | 'warning' | 'danger';

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  severity: ActivitySeverity;
  title: string;
  message: string;
  createdAt?: string;
  created_at?: string;
  entity?: {
    type: string;
    id: string;
  };
}

export interface ActivityFeedResponse {
  items: ActivityFeedItem[];
}

export function useActivityFeed(limit = 6) {
  return useQuery({
    queryKey: ['admin', 'activity-feed', limit],
    queryFn: async () =>
      (await api.get<ActivityFeedResponse>(ENDPOINTS.ADMIN_ACTIVITY_FEED, {
        params: { limit },
      })) as unknown as ActivityFeedResponse,
  });
}
