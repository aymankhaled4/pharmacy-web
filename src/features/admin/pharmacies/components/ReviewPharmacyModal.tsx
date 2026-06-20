import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

import { useRejectPharmacy } from '../hooks/useRejectPharmacy'
import type { AdminPharmacy } from '../types'

const rejectSchema = z.object({
  rejection_reason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters.'),
})

interface ReviewPharmacyModalProps {
  pharmacy: AdminPharmacy | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ReviewPharmacyModal({
  pharmacy,
  open,
  onOpenChange,
}: ReviewPharmacyModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const rejectPharmacy = useRejectPharmacy(() => {
    setReason('')
    setError(null)
    onOpenChange(false)
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReason('')
      setError(null)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = () => {
    if (!pharmacy) return

    const result = rejectSchema.safeParse({
      rejection_reason: reason.trim(),
    })

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid rejection reason.')
      return
    }

    rejectPharmacy.mutate({
      pharmacyId: pharmacy.id,
      reason: result.data.rejection_reason,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1">
            <DialogTitle>Reject pharmacy</DialogTitle>
            <DialogDescription>
              {pharmacy?.pharmacy_name ??
                'Add a reason before rejecting this pharmacy.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <Textarea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              setError(null)
            }}
            placeholder="Write the rejection reason..."
            aria-invalid={Boolean(error)}
            disabled={rejectPharmacy.isPending}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={rejectPharmacy.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={rejectPharmacy.isPending}
          >
            {rejectPharmacy.isPending ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
