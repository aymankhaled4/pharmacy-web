import { Bell, CheckCircle2, PackageCheck, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { PharmacyNotification } from '../hooks/useNotifications'

interface NotificationsListProps {
  notifications: PharmacyNotification[]
  isLoading?: boolean
  loadingItemCount?: number
  emptyMessage?: string
  compact?: boolean
  onNotificationClick?: (notification: PharmacyNotification) => void
}

const typeIcons: Record<string, typeof Bell> = {
  reservation_created: PackageCheck,
  reservation_confirmed: CheckCircle2,
  reservation_cancelled: XCircle,
  reservation_expired: XCircle,
}

function formatRelativeTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Time unavailable'

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(Math.floor(diffMs / 60000), 0)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export default function NotificationsList({
  notifications,
  isLoading = false,
  loadingItemCount = 5,
  emptyMessage = 'No notifications yet.',
  compact = false,
  onNotificationClick,
}: NotificationsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: loadingItemCount }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <div className="size-9 shrink-0 animate-pulse rounded-full bg-slate-100" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return <p className="py-4 text-sm text-slate-500">{emptyMessage}</p>
  }

  return (
    <div className={cn('divide-y divide-slate-100', compact && '-mx-2')}>
      {notifications.map((notification) => {
        const Icon = typeIcons[notification.type] ?? Bell
        const unread = !notification.is_read

        return (
          <button
            key={notification.id}
            type="button"
            className={cn(
              'flex w-full gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-slate-50',
              unread && 'bg-blue-50/45',
            )}
            onClick={() => onNotificationClick?.(notification)}
          >
            <div
              className={cn(
                'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
                unread
                  ? 'bg-[#014AB3]/10 text-[#014AB3]'
                  : 'bg-slate-100 text-slate-500',
              )}
            >
              <Icon className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <p className="line-clamp-1 text-sm font-semibold text-slate-950">
                  {notification.title}
                </p>
                {unread && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500" />
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                {notification.message}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatRelativeTime(notification.created_at)}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
