import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import api from '@/core/api/axios'
import { ENDPOINTS } from '@/core/api/endpoints'

export interface PharmacyNotification {
  id: string
  user_id: string | null
  pharmacy_id: string | null
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

function normalizeNotifications(response: unknown): PharmacyNotification[] {
  if (Array.isArray(response)) return response

  if (response && typeof response === 'object') {
    const payload = response as {
      data?: unknown
      items?: unknown
      notifications?: unknown
    }

    if (Array.isArray(payload.items)) return payload.items
    if (Array.isArray(payload.notifications)) return payload.notifications
    if (payload.data) return normalizeNotifications(payload.data)
  }

  return []
}

function getErrorMessage(error: unknown) {
  return typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message: unknown }).message)
    : 'Notification action failed. Please try again.'
}

export function useNotifications() {
  return useQuery<unknown, Error, PharmacyNotification[]>({
    queryKey: ['pharmacy-notifications'],
    queryFn: () => api.get(ENDPOINTS.NOTIFICATIONS_ME),
    select: normalizeNotifications,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) =>
      api.patch(ENDPOINTS.NOTIFICATION_READ(notificationId), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-notifications'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.patch(ENDPOINTS.NOTIFICATIONS_READ_ALL, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-notifications'] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
