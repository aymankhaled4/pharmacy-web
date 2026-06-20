import { useMemo, useState } from 'react';
import { Building2, CheckCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/shared/EmptyState';
import PageHeader from '@/components/shared/PageHeader';
import Pagination from '@/components/shared/Pagination';
import DataTable, { type DataTableColumn } from '@/components/shared/DataTable';
import VerificationStatsBar from '../components/VerificationStatsBar';
import RejectModal from '../components/RejectModal';
import { usePendingPharmacies } from '../hooks/usePendingPharmacies';
import { useAnalyticsOverview } from '../hooks/useAnalyticsOverview';
import { useApprovePharmacy } from '../../pharmacies/hooks/useApprovePharmacy';
import { useRejectPharmacy } from '../../pharmacies/hooks/useRejectPharmacy';
import { formatRelativeTime } from '@/lib/format';
import type { AdminPharmacy } from '@/features/admin/types/admin.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PAGE_SIZE = 5;

export default function VerificationQueuePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<AdminPharmacy | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data: pharmacies = [], isLoading } = usePendingPharmacies();
  const { data: analytics } = useAnalyticsOverview();
  const { mutate: approvePharmacy } = useApprovePharmacy();
  const { mutate: rejectPharmacy, isPending: isRejecting } = useRejectPharmacy();

  const filteredPharmacies = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = Array.isArray(pharmacies) ? pharmacies : [];

    if (!query) return list;

    return list.filter(
      (pharmacy) =>
        pharmacy.pharmacy_name?.toLowerCase().includes(query) ||
        pharmacy.license_number?.toLowerCase().includes(query) ||
        pharmacy.city?.toLowerCase().includes(query) ||
        pharmacy.address?.toLowerCase().includes(query)
    );
  }, [pharmacies, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPharmacies.length / PAGE_SIZE));
  const paginatedPharmacies = filteredPharmacies.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleApprove = (pharmacyId: string) => {
    setApprovingId(pharmacyId);
    approvePharmacy(pharmacyId, {
      onSettled: () => setApprovingId(null),
    });
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget) return;

    rejectPharmacy(
      { pharmacyId: rejectTarget.id, rejection_reason: reason },
      {
        onSuccess: () => setRejectTarget(null),
      }
    );
  };

  const columns: DataTableColumn<AdminPharmacy>[] = [
    {
      id: 'details',
      header: 'Pharmacy Details',
      cell: (pharmacy) => (
        <div className="flex items-start gap-3 py-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#014AB3]/10 text-[#014AB3]">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{pharmacy.pharmacy_name}</p>
            <p className="text-muted-foreground text-xs">
              {pharmacy.address}, {pharmacy.city}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">{pharmacy.phone}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'license',
      header: 'License Number',
      cell: (pharmacy) => (
        <span className="font-mono text-sm text-gray-700">{pharmacy.license_number}</span>
      ),
    },
    {
      id: 'submitted',
      header: 'Submitted',
      cell: (pharmacy) => (
        <span className="text-sm text-gray-600">
          {formatRelativeTime(pharmacy.created_at)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Verification',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (pharmacy) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setRejectTarget(pharmacy)}
            disabled={isRejecting || approvingId === pharmacy.id}
          >
            Reject
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-[#014AB3] text-white hover:bg-[#0140a0]"
            onClick={() => handleApprove(pharmacy.id)}
            disabled={isRejecting || approvingId === pharmacy.id}
          >
            {approvingId === pharmacy.id ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs="Dashboard / Pharmacy Verifications"
        title="Verification Queue"
        description="Review and validate pharmacy credentials to maintain network security."
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search license or name..."
              className="pl-9"
            />
          </div>
        }
      />

      <VerificationStatsBar
        pharmacies={Array.isArray(pharmacies) ? pharmacies : []}
        analytics={analytics}
      />

      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Pending Pharmacies</CardTitle>
              <CardDescription>
                Records requiring administrative review and approval.
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {Array.isArray(pharmacies) ? pharmacies.length : 0} Requests
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              Loading pending pharmacies...
            </div>
          ) : filteredPharmacies.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<CheckCircle className="h-12 w-12 text-green-500" />}
                title="All caught up!"
                description="No pharmacies are waiting for verification"
              />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={paginatedPharmacies}
              getRowKey={(pharmacy) => pharmacy.id}
              emptyMessage="No pharmacies match your search."
            />
          )}
        </CardContent>

        {!isLoading && filteredPharmacies.length > 0 && (
          <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Showing {paginatedPharmacies.length} of {filteredPharmacies.length} pending
              records
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <RejectModal
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
        pharmacyName={rejectTarget?.pharmacy_name}
        onConfirm={handleRejectConfirm}
        isLoading={isRejecting}
      />
    </div>
  );
}
