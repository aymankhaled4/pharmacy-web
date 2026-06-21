import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import ReservationStatusBadge from './ReservationStatusBadge'
import type { PharmacyReservation } from '../types'

interface ReservationTableProps {
  reservations: PharmacyReservation[]
  onConfirm: (shortCode: string) => void
  onCancel: (reservationId: string) => void
}

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp)
  const delta = date.getTime() - Date.now()
  const seconds = Math.round(delta / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)

  if (Math.abs(seconds) < 60) return seconds >= 0 ? 'in a few seconds' : 'just now'
  if (Math.abs(minutes) < 60) return seconds >= 0 ? `in ${minutes} min` : `${Math.abs(minutes)} min ago`
  if (Math.abs(hours) < 24) return seconds >= 0 ? `in ${hours} hr` : `${Math.abs(hours)} hr ago`
  if (Math.abs(days) < 7) return seconds >= 0 ? `in ${days} days` : `${Math.abs(days)} days ago`
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatCreatedAt(timestamp: string) {
  const date = new Date(timestamp)
  const delta = Date.now() - date.getTime()
  const minutes = Math.round(delta / 60000)
  const hours = Math.round(minutes / 60)
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hr ago`
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ReservationTable({ reservations, onConfirm, onCancel }: ReservationTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Code</TableHead>
          <TableHead className="text-center">Medicine</TableHead>
          <TableHead className="text-center">Client</TableHead>
          <TableHead className="text-center">Qty</TableHead>
          <TableHead className="text-center">Total</TableHead>
          <TableHead className="text-center">Created</TableHead>
          <TableHead className="text-center">Expires</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((reservation) => (
          <TableRow key={reservation.id}>
            <TableCell className="text-center">
              <Badge className="bg-blue-100 text-blue-700">{reservation.short_code}</Badge>
            </TableCell>
            <TableCell className="text-center">
              {reservation.inventory.drug.brand_name} {reservation.inventory.drug.strength}
            </TableCell>
            <TableCell className="text-center">
              <div className="space-y-1">
                <p>{reservation.user.full_name}</p>
                <p className="text-xs text-muted-foreground">{reservation.user.phone}</p>
              </div>
            </TableCell>
            <TableCell className="text-center">{reservation.quantity}</TableCell>
            <TableCell className="text-center">{reservation.total_price.toFixed(2)} EGP</TableCell>
            <TableCell className="text-center">{formatCreatedAt(reservation.created_at)}</TableCell>
            <TableCell className="text-center">{formatRelativeTime(reservation.expires_at)}</TableCell>
            <TableCell className="text-center">
              <ReservationStatusBadge status={reservation.status} />
            </TableCell>
            <TableCell className="text-center">
              {reservation.status === 'pending' ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onConfirm(reservation.short_code)}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onCancel(reservation.id)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No actions</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}