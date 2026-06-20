import { Badge } from '@/components/ui/badge'
import type { ReservationStatus } from '../types'

const statusStyles: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabels: Record<ReservationStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

export default function ReservationStatusBadge({
  status,
}: {
  status: ReservationStatus
}) {
  return <Badge className={statusStyles[status]}>{statusLabels[status]}</Badge>
}
