import ConfirmModal from '@/components/shared/ConfirmModal'
import { useCancelPharmacyReservation } from '../hooks/useCancelPharmacyReservation'

interface CancelReservationModalProps {
  reservationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CancelReservationModal({
  reservationId,
  open,
  onOpenChange,
}: CancelReservationModalProps) {
  const { mutate: cancelReservation, isPending } = useCancelPharmacyReservation(() => {
    onOpenChange(false)
  })

  const handleConfirm = () => {
    if (!reservationId) return
    cancelReservation(reservationId)
  }

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel Reservation"
      description="Are you sure you want to cancel this reservation? This action cannot be undone."
      confirmText="Cancel Reservation"
      cancelText="Keep Reservation"
      onConfirm={handleConfirm}
      isLoading={isPending}
      confirmVariant="destructive"
    />
  )
}
