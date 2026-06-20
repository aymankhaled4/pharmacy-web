import { useMemo, useState } from 'react'
import {
  Ban,
  Building2,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react'

import DataTable from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import PharmacyTable from '../components/PharmacyTable'
import { useAdminPharmacies } from '../hooks/useAdminPharmacies'
import type { PharmacyStatus } from '../types'

type StatusFilter = Exclude<PharmacyStatus, 'pending'> | 'all'

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All Status' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export default function PharmaciesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const allPharmaciesQuery = useAdminPharmacies('all')
  const pharmaciesQuery = useAdminPharmacies(statusFilter)

  const allPharmacies = allPharmaciesQuery.data ?? []
  const pharmacies = pharmaciesQuery.data ?? []

  const stats = useMemo(
    () => ({
      total: allPharmacies.length,
      active: allPharmacies.filter(
        (pharmacy) => pharmacy.status === 'approved',
      ).length,
      suspended: allPharmacies.filter(
        (pharmacy) => pharmacy.status === 'rejected',
      ).length,
    }),
    [allPharmacies],
  )

  const displayedPharmacies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return pharmacies

    return pharmacies.filter((pharmacy) => {
      const name = pharmacy.pharmacy_name.toLowerCase()
      const license = pharmacy.license_number.toLowerCase()
      return name.includes(query) || license.includes(query)
    })
  }, [pharmacies, searchQuery])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
          Pharmacies Management
        </h1>
        <p className="text-sm text-slate-500">
          Monitor, approve, and manage your pharmacy partner network.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Total Pharmacies"
          value={stats.total}
          helper="+12% from last month"
          icon={Building2}
          isLoading={allPharmaciesQuery.isLoading}
        />
        <StatsCard
          label="Active Partners"
          value={stats.active}
          helper="Approved pharmacy accounts"
          icon={CheckCircle2}
          isLoading={allPharmaciesQuery.isLoading}
        />
        <StatsCard
          label="Suspended"
          value={stats.suspended}
          helper="Rejected or policy audits"
          icon={Ban}
          isLoading={allPharmaciesQuery.isLoading}
        />
      </section>

      <DataTable>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
              placeholder="Search by pharmacy name or license..."
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="h-8 rounded-lg border border-input bg-white px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                if (statusFilter === 'all') {
                  pharmaciesQuery.refetch()
                }
                allPharmaciesQuery.refetch()
              }}
              disabled={allPharmaciesQuery.isFetching || pharmaciesQuery.isFetching}
              aria-label="Refresh pharmacies"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </div>

        {pharmaciesQuery.isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex size-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Ban className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-950">
                Pharmacies could not be loaded
              </p>
              <p className="text-sm text-slate-500">
                Please refresh or try again later.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => pharmaciesQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <PharmacyTable
            pharmacies={displayedPharmacies}
            isLoading={pharmaciesQuery.isLoading}
          />
        )}
      </DataTable>
    </div>
  )
}

interface StatsCardProps {
  label: string
  value: number
  helper: string
  icon: typeof Building2
  isLoading: boolean
}

function StatsCard({
  label,
  value,
  helper,
  icon: Icon,
  isLoading,
}: StatsCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-sm text-slate-500">{label}</p>
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="text-2xl font-semibold text-slate-950">
              {formatCount(value)}
            </p>
          )}
          <p className="text-xs text-slate-500">{helper}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}
