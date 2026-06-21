import PageHeader from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'

import NotificationsList from '../components/NotificationsList'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications'
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications'

export default function NotificationsPage() {
  const notificationsQuery = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  useRealtimeNotifications()

  const notifications = notificationsQuery.data ?? []
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Track reservation updates and pharmacy alerts."
        actions={
          <Button
            type="button"
            variant="outline"
            disabled={unreadCount === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </Button>
        }
      />

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <NotificationsList
          notifications={notifications}
          isLoading={notificationsQuery.isLoading}
          emptyMessage="No notifications yet."
          onNotificationClick={(notification) => {
            if (!notification.is_read) {
              markRead.mutate(notification.id)
            }
          }}
        />
      </div>
    </div>
  )
}
