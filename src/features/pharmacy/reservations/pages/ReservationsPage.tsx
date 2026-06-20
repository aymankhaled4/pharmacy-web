import { useState, useMemo } from 'react'
import { Search, ClipboardList, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DataTable from '@/components/shared/DataTable'
import ConfirmPickupModal from '../components/ConfirmPickupModal'
import CancelReservationModal from '../components/CancelReservationModal'
import ReservationTable from '../components/ReservationTable'
import { usePharmacyReservations } from '../hooks/usePharmacyReservations'
import type { ReservationStatus } from '../types'

const filterTabs: Array<{ key: ReservationStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'expired', label: 'Expired' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function ReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')
  const [pickupCode, setPickupCode] = useState('')
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false)
  const [modalShortCode, setModalShortCode] = useState('')
  const [cancelReservationId, setCancelReservationId] = useState<string | null>(null)
  const { data: allReservations = [] } = usePharmacyReservations('all')
  const { data: filteredReservations = [], isLoading, isError, error } =
    usePharmacyReservations(statusFilter)

  // Stats
  const stats = useMemo(() => ({
    all: allReservations.length,
    pending: allReservations.filter((r) => r.status === 'pending').length,
    verifiedToday: allReservations.filter((r) => {
      if (r.status !== 'confirmed' || !r.confirmed_at) return false
      return new Date(r.confirmed_at).toDateString() === new Date().toDateString()
    }).length,
  }), [allReservations])

  const tableData = useMemo(() => {
    const trimmed = pickupCode.trim().toUpperCase()
    if (!trimmed) return filteredReservations
    return allReservations.filter((r) => r.short_code.toUpperCase() === trimmed)
  }, [pickupCode, filteredReservations, allReservations])

  const searchedReservation = useMemo(() => {
    const trimmed = pickupCode.trim().toUpperCase()
    if (!trimmed) return null
    return allReservations.find((r) => r.short_code.toUpperCase() === trimmed) ?? null
  }, [pickupCode, allReservations])

  const isConfirmEnabled = searchedReservation?.status === 'pending'

  const openPickupModal = (shortCode: string) => {
    setModalShortCode(shortCode)
    setIsPickupModalOpen(true)
  }

  const handleQuickVerify = () => {
    if (!isConfirmEnabled || !searchedReservation) return
    openPickupModal(searchedReservation.short_code)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Bookings Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Handle incoming drug reservations and verify customer pickups.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="All Reservations"
          value={stats.all}
          icon={<ClipboardList className="h-5 w-5 text-indigo-500" />}
          iconBg="bg-indigo-50"
        />
        <StatCard
          label="Pending Pickups"
          value={stats.pending}
          icon={<Clock className="h-5 w-5 text-pink-500" />}
          iconBg="bg-pink-50"
        />
        <StatCard
          label="Verified Today"
          value={stats.verifiedToday}
          icon={<CheckCircle className="h-5 w-5 text-white" />}
          iconBg="bg-[#014AB3]"
        />
      </div>

      {/* Quick Pickup Verification */}
      <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-indigo-500 font-bold text-lg">#</span>
          <h2 className="font-semibold text-gray-900">Quick Pickup Verification</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the short code provided by the customer to process pickup.
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value)}
              placeholder="EX: MC-8291"
              className="pl-9 bg-white"
            />
          </div>
          <Button
            onClick={handleQuickVerify}
            disabled={!isConfirmEnabled}
            className="bg-[#014AB3] hover:bg-[#0244a1] text-white disabled:opacity-50"
          >
            Confirm Pickup →
          </Button>
        </div>

        {/* Feedback */}
        {pickupCode.trim() && searchedReservation && (
          <p className={`mt-2 text-xs font-medium ${isConfirmEnabled ? 'text-green-600' : 'text-amber-600'}`}>
            {isConfirmEnabled
              ? `✓ Pending — ${searchedReservation.inventory.drug.brand_name} · ${searchedReservation.user.full_name}`
              : `Found (${searchedReservation.status}) — ${searchedReservation.inventory.drug.brand_name} · ${searchedReservation.user.full_name} — cannot confirm`}
          </p>
        )}
        {pickupCode.trim() && !searchedReservation && (
          <p className="mt-2 text-xs text-red-500">No reservation found for this code.</p>
        )}
      </div>

      {/* Active Bookings Queue */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-gray-900">Active Bookings Queue</h2>
            <p className="text-sm text-muted-foreground">
              {pickupCode.trim()
                ? `Showing results for "${pickupCode.trim().toUpperCase()}"`
                : 'Real-time view of customers waiting for collection.'}
            </p>
          </div>
          {!pickupCode.trim() && (
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    statusFilter === tab.key
                      ? 'bg-[#014AB3] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          {pickupCode.trim() && (
            <button
              onClick={() => setPickupCode('')}
              className="text-sm text-[#014AB3] hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        <DataTable>
          {isLoading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Loading reservations...</div>
          ) : isError ? (
            <div className="p-10 text-center text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to load reservations.'}
            </div>
          ) : tableData.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {pickupCode.trim() ? `No reservation found for code "${pickupCode.trim().toUpperCase()}".` : 'No reservations found.'}
            </div>
          ) : (
            <ReservationTable
              reservations={tableData}
              onConfirm={(shortCode) => openPickupModal(shortCode)}
              onCancel={(reservationId) => setCancelReservationId(reservationId)}
            />
          )}
        </DataTable>
      </div>

      {/* Modals */}
      <ConfirmPickupModal
        open={isPickupModalOpen}
        defaultShortCode={modalShortCode}
        onOpenChange={(open) => {
          setIsPickupModalOpen(open)
          if (!open) setModalShortCode('')
        }}
      />
      <CancelReservationModal
        reservationId={cancelReservationId}
        open={Boolean(cancelReservationId)}
        onOpenChange={(open) => {
          if (!open) setCancelReservationId(null)
        }}
      />
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  iconBg: string
}

function StatCard({ label, value, icon, iconBg }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`rounded-xl p-2.5 ${iconBg}`}>
        {icon}
      </div>
    </div>
  )
}