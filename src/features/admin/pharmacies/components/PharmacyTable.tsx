import { FileText, MapPin } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { AdminPharmacy } from '../types'
import PharmacyStatusBadge from './PharmacyStatusBadge'

interface PharmacyTableProps {
  pharmacies: AdminPharmacy[]
  isLoading?: boolean
}

const joinedDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function formatJoinedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return joinedDateFormatter.format(date)
}

// function getReservationsCount(pharmacy: AdminPharmacy) {
//   if (typeof pharmacy.reservation_count === 'number') {
//     return pharmacy.reservation_count
//   }
//   if (typeof pharmacy.reservations_count === 'number') {
//     return pharmacy.reservations_count
//   }
//   if (typeof pharmacy.total_reservations === 'number') {
//     return pharmacy.total_reservations
//   }
//   if (typeof pharmacy.reservations === 'number') return pharmacy.reservations
//   if (Array.isArray(pharmacy.reservations)) return pharmacy.reservations.length
//   return 0
// }

export default function PharmacyTable({
  pharmacies,
  isLoading = false,
}: PharmacyTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
          <TableHead className="w-[28%] px-5 text-xs text-slate-500">
            Pharmacy Name
          </TableHead>
          <TableHead className="w-[23%] text-xs text-slate-500">
            Location
          </TableHead>
          <TableHead className="text-xs text-slate-500">
            License Number
          </TableHead>
          <TableHead className="text-xs text-slate-500">Status</TableHead>
          {/* <TableHead className="text-xs text-slate-500">
            Reservations
          </TableHead> */}
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading &&
          Array.from({ length: 5 }, (_, index) => (
            <TableRow key={index}>
              <TableCell colSpan={5} className="px-5 py-3">
                <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
              </TableCell>
            </TableRow>
          ))}

        {!isLoading && pharmacies.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="h-40 text-center">
              <div className="mx-auto max-w-sm space-y-2">
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <FileText className="size-5" />
                </div>
                <p className="font-medium text-slate-900">No pharmacies found</p>
                <p className="text-sm text-slate-500">
                  Try changing the search or status filter.
                </p>
              </div>
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          pharmacies.map((pharmacy) => (
            <TableRow key={pharmacy.id} className="hover:bg-slate-50/60">
              <TableCell className="px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {pharmacy.pharmacy_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Joined: {formatJoinedDate(pharmacy.created_at)}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-4">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  <div className="min-w-0 whitespace-normal">
                    <p className="font-medium text-slate-700">
                      {pharmacy.city || '-'}
                    </p>
                    <p className="line-clamp-2 text-xs text-slate-500">
                      {pharmacy.address || '-'}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-4 font-mono text-xs text-slate-600">
                {pharmacy.license_number || '-'}
              </TableCell>

              <TableCell className="py-4">
                <PharmacyStatusBadge status={pharmacy.status} />
              </TableCell>

              {/* <TableCell className="py-4 text-slate-600">
                {getReservationsCount(pharmacy)}
              </TableCell> */}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
