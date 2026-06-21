import { Ban, CheckCircle2, Clock3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { PharmacyStatus } from '../types'

const styles: Record<PharmacyStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
}

const labels: Record<PharmacyStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

const icons: Record<PharmacyStatus, typeof Clock3> = {
  pending: Clock3,
  approved: CheckCircle2,
  rejected: Ban,
}

interface PharmacyStatusBadgeProps {
  status: PharmacyStatus
}

export default function PharmacyStatusBadge({
  status,
}: PharmacyStatusBadgeProps) {
  const Icon = icons[status]

  return (
    <Badge variant="outline" className={cn('gap-1', styles[status])}>
      <Icon className="size-3" />
      {labels[status]}
    </Badge>
  )
}
