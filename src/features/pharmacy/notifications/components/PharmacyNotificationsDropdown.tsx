import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  type PharmacyNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications'
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications'
import NotificationsList from './NotificationsList'

const EMPTY_NOTIFICATIONS: PharmacyNotification[] = []

export default function PharmacyNotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const notificationsQuery = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  useRealtimeNotifications()

  const notifications = notificationsQuery.data ?? EMPTY_NOTIFICATIONS
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  )

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className={cn(
          'relative rounded-full text-gray-600 hover:text-[#014AB3]',
          isOpen && 'bg-blue-50 text-[#014AB3]',
        )}
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-950">
                Notifications
              </h2>
              <p className="text-xs text-gray-500">
                {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={unreadCount === 0 || markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </Button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto p-3">
            <NotificationsList
              compact
              notifications={notifications.slice(0, 8)}
              isLoading={notificationsQuery.isLoading}
              loadingItemCount={5}
              emptyMessage="No notifications yet."
              onNotificationClick={(notification) => {
                if (!notification.is_read) {
                  markRead.mutate(notification.id)
                }
              }}
            />
          </div>

          <div className="border-t bg-slate-50 px-4 py-3 text-right">
          </div>
        </div>
      )}
    </div>
  )
}
