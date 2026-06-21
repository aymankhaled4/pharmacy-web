import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuthStore } from '@/core/auth/auth.store'
import { supabase } from '@/core/supabase/supabase.client'

type RealtimeNotificationPayload = {
  id?: string
  title?: string
  message?: string
  pharmacy_id?: string
}

export function useRealtimeNotifications() {
  const queryClient = useQueryClient()
  const pharmacyId = useAuthStore((state) => state.user?.id)

  useEffect(() => {
    if (!pharmacyId) return

    const channel = supabase
      .channel(`pharmacy-notifications-${pharmacyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `pharmacy_id=eq.${pharmacyId}`,
        },
        (payload) => {
          const notification = payload.new as RealtimeNotificationPayload
          toast(notification.title ?? 'New notification', {
            description: notification.message,
          })
          queryClient.invalidateQueries({
            queryKey: ['pharmacy-notifications'],
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [pharmacyId, queryClient])
}
