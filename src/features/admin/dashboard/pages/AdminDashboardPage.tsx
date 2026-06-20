import { useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  CalendarDays,
  Download,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import ActivityFeedList from '../components/ActivityFeedList';
import KpiCard from '../components/KpiCard';
import TopPurchasedChart from '../components/TopPurchasedChart';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { useAnalyticsOverview } from '../hooks/useAnalyticsOverview';
import { useRecentReservations, type AdminReservation, type AdminReservationStatus } from '../hooks/useRecentReservations';
import { useTopPurchasedDrugs, type TopPurchasedDrug } from '../hooks/useTopPurchasedDrugs';

// ─── Status badge ─────────────────────────────────────────────────────────────
const statusConfig: Record<AdminReservationStatus, { label: string; pill: string }> = {
  pending: { label: 'Pending', pill: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', pill: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', pill: 'bg-rose-100 text-rose-700' },
  expired: { label: 'Expired', pill: 'bg-gray-100 text-gray-600' },
};

function StatusBadge({ status }: { status: AdminReservationStatus }) {
  const { label, pill } = statusConfig[status] ?? statusConfig.expired;
  return (
    <span className={cn('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium', pill)}>
      {label}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatNumber(value?: number) {
  return new Intl.NumberFormat('en-US').format(value ?? 0);
}

function getRequestedMedicineCount(item: TopPurchasedDrug) {
  return (
    item.total_requested ??
    item.total_requests ??
    item.total_orders ??
    item.request_count ??
    item.requested_count ??
    item.total_purchased ??
    item.count ??
    0
  );
}

function getRequestedMedicineName(item: TopPurchasedDrug) {
  return item.brand_name || item.name || item.drug_name || item.brand_name_ar || item.active_ingredient || 'Unknown medicine';
}

function getDrugName(reservation: AdminReservation) {
  return (
    reservation.inventory?.drugs?.brand_name ||
    reservation.inventory?.drugs?.brand_name_ar ||
    reservation.inventory?.drugs?.active_ingredient ||
    'Unknown medicine'
  );
}

function getPharmacyName(reservation: AdminReservation) {
  return reservation.inventory?.pharmacy_profiles?.pharmacy_name || 'Unknown pharmacy';
}

function getUserName(reservation: AdminReservation) {
  return reservation.user_profiles?.full_name || 'Unknown user';
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function buildWeeklyReservationData(reservations: AdminReservation[]) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = labels.map((day) => ({ day, reservations: 0 }));

  reservations.forEach((reservation) => {
    const day = new Date(reservation.created_at).getDay();
    counts[day].reservations += 1;
  });

  const today = new Date().getDay();
  return [...counts.slice(today + 1), ...counts.slice(0, today + 1)];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const overview = useAnalyticsOverview();
  const activityFeed = useActivityFeed(showAllActivity ? 50 : 6);
  const purchased = useTopPurchasedDrugs(5);
  const recentReservations = useRecentReservations(100);

  const reservations = useMemo(() => recentReservations.data?.items ?? [], [recentReservations.data?.items]);

  const sortedPurchased = useMemo(
    () =>
      [...(purchased.data ?? [])].sort((a, b) => getRequestedMedicineCount(b) - getRequestedMedicineCount(a)),
    [purchased.data],
  );

  // 5 reservations by default, all if expanded
  const visibleReservations = showAllBookings ? reservations : reservations.slice(0, 5);

  const topMedicine = sortedPurchased[0] ? getRequestedMedicineName(sortedPurchased[0]) : 'No data yet';
  const weeklyReservationData = useMemo(() => buildWeeklyReservationData(reservations), [reservations]);

  const handleDownloadReport = () => {
    const rows = [
      ['User', 'Pharmacy', 'Medicine', 'Status', 'Quantity', 'Total Price', 'Created At'],
      ...reservations.map((reservation) => [
        getUserName(reservation),
        getPharmacyName(reservation),
        getDrugName(reservation),
        reservation.status,
        String(reservation.quantity),
        String(reservation.total_price),
        reservation.created_at,
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admin-dashboard-reservations.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back. Here's what's happening in MedConnect today.
          </p>
        </div>

        
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Pharmacies"
          value={formatNumber(overview.data?.pharmacies.total)}
          icon={Building2}
        />
        <KpiCard
          title="Active Users"
          value={formatNumber(overview.data?.users.active)}
          icon={Users}
          tone="cyan"
        />
        <KpiCard
          title="Total Reservations"
          value={formatNumber(overview.data?.reservations.total)}
          icon={CalendarDays}
          tone="green"
          note={`${formatNumber(overview.data?.reservations.pending)} pending`}
        />
        <KpiCard title="Top Medicine" value={topMedicine} icon={Activity} tone="amber"  />
      </div>

      {/* ── Chart + Top Purchased ── */}
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <Card className="rounded-lg border-0 bg-white shadow-sm ring-1 ring-gray-200/70">
          <CardHeader className="items-start gap-3 sm:flex sm:flex-row sm:justify-between">
            <div>
              <CardTitle>Reservations Over Time</CardTitle>
              <CardDescription>Daily reservation activity from the latest bookings</CardDescription>
            </div>
            <Button variant="outline" className="bg-white" onClick={handleDownloadReport}>
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyReservationData} margin={{ left: -20, right: 8, top: 12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reservationsBlue" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#014AB3" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#014AB3" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eef2f7" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#667085' }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#667085' }} />
                  <Tooltip
                    cursor={{ stroke: '#014AB3', strokeOpacity: 0.14 }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(15,23,42,.08)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reservations"
                    stroke="#014AB3"
                    strokeWidth={3}
                    fill="url(#reservationsBlue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <TopPurchasedChart items={sortedPurchased} isLoading={purchased.isLoading} />
      </div>

      {/* ── Reservations Table + Activity Feed ── */}
      <div
        className={cn(
          'grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]',
          showAllBookings || showAllActivity ? 'items-start' : 'items-stretch',
        )}
      >
        {/* Reservations Table */}
        <Card className={cn('flex flex-col rounded-lg border-0 bg-white shadow-sm ring-1 ring-gray-200/70', !showAllBookings && !showAllActivity && 'h-full')}>
          <CardHeader className="items-start gap-3 border-b sm:flex sm:flex-row sm:justify-between">
            <div>
              <CardTitle>Recent Reservations</CardTitle>
              <CardDescription>Overview of the latest system bookings</CardDescription>
            </div>
            <Button
              type="button"
              variant="link"
              className="text-[#014AB3]"
              onClick={() => setShowAllBookings((current) => !current)}
              disabled={reservations.length <= 5}
            >
              {showAllBookings ? 'Show Latest 5' : 'View All Bookings'}
            </Button>
          </CardHeader>
          <CardContent className={cn('p-0', !showAllBookings && !showAllActivity && 'flex-1', showAllBookings && 'max-h-[42rem] overflow-y-auto [scrollbar-gutter:stable]')}>
              <Table className="table-fixed">
                <colgroup>
                  <col className="w-[20%]" />
                  <col className="w-[23%]" />
                  <col className="w-[27%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="py-3.5 pl-6 pr-3 text-xs font-semibold uppercase tracking-wide text-gray-500">User</TableHead>
                    <TableHead className="py-3.5 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Pharmacy</TableHead>
                    <TableHead className="py-3.5 px-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Medicine</TableHead>
                    <TableHead className="py-3.5 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</TableHead>
                    <TableHead className="py-3.5 pl-3 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReservations.isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="border-0">
                        <TableCell colSpan={5} className="pl-6 pr-6 py-4">
                          <div className="h-5 animate-pulse rounded bg-gray-100" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : visibleReservations.length ? (
                    visibleReservations.map((reservation) => (
                      <TableRow
                        key={reservation.id}
                        className="border-0 bg-white transition-colors hover:bg-gray-50/50"
                      >
                        <TableCell className="py-5 pl-6 pr-3 text-sm font-semibold text-gray-900 whitespace-normal break-words">
                          {getUserName(reservation)}
                        </TableCell>
                        <TableCell className="py-5 px-3 text-sm text-gray-600 whitespace-normal break-words">
                          {getPharmacyName(reservation)}
                        </TableCell>
                        <TableCell className="py-5 px-3 text-sm text-gray-600 whitespace-normal break-words">
                          {getDrugName(reservation)}
                        </TableCell>
                        <TableCell className="py-5 px-3 whitespace-normal">
                          <StatusBadge status={reservation.status} />
                        </TableCell>
                        <TableCell className="py-5 pl-3 pr-6 text-right text-xs text-gray-400 whitespace-normal">
                          {formatRelativeTime(reservation.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-28 text-center text-sm text-gray-500">
                        No recent reservations yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <div className={cn('grid gap-4', !showAllBookings && !showAllActivity && 'h-full')}>
          <Card className={cn('flex flex-col rounded-lg border-0 bg-white shadow-sm ring-1 ring-gray-200/70', !showAllBookings && !showAllActivity && 'h-full')}>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#014AB3]" />
                Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent className={cn('flex flex-col gap-4 pt-4', !showAllBookings && !showAllActivity && 'flex-1')}>
              <div className={cn('pr-1', showAllActivity ? 'max-h-[42rem] overflow-y-auto' : 'overflow-hidden')}>
                <ActivityFeedList
                  items={activityFeed.data?.items ?? []}
                  isLoading={activityFeed.isLoading}
                  loadingItemCount={6}
                />
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full bg-blue-50 text-[#014AB3] hover:bg-blue-100"
                onClick={() => setShowAllActivity((prev) => !prev)}
              >
                {showAllActivity ? 'Show Less' : 'View Full Logs'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {overview.isError || activityFeed.isError || purchased.isError || recentReservations.isError
          ? 'Some dashboard data could not be loaded.'
          : 'Dashboard loaded.'}
      </div>
    </section>
  );
}
