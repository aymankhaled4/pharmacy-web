import { useEffect, useState } from 'react';
import { CheckCircle, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/shared/EmptyState';
import PageHeader from '@/components/shared/PageHeader';
import CursorPagination from '@/components/shared/CursorPagination';
import VerificationStatsBar from '../components/VerificationStatsBar';
import VerificationTable from '../components/VerificationTable';
import RejectModal from '../components/RejectModal';
import {
  usePendingPharmacies,
} from '../hooks/usePendingPharmacies';
import { useAnalyticsOverview } from '../hooks/useAnalyticsOverview';
import { useApprovePharmacy } from '../../pharmacies/hooks/useApprovePharmacy';
import { useRejectPharmacy } from '../../pharmacies/hooks/useRejectPharmacy';
import type { AdminPharmacy } from '@/features/admin/types/admin.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const SEARCH_DEBOUNCE_MS = 300;

export default function VerificationQueuePage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [rejectTarget, setRejectTarget] = useState<AdminPharmacy | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCursor(undefined);
      setCursorStack([]);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = usePendingPharmacies({
    search: debouncedSearch,
    cursor,
  });
  const { data: analytics } = useAnalyticsOverview();
  const { mutate: approvePharmacy } = useApprovePharmacy();
  const { mutate: rejectPharmacy, isPending: isRejecting } = useRejectPharmacy();

  const pharmacies = data?.items ?? [];
  const nextCursor = data?.nextCursor ?? null;
  const totalPending = data?.total ?? analytics?.pending_pharmacies ?? null;

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

  const handleNextPage = () => {
    if (!nextCursor) return;
    setCursorStack((current) => [...current, cursor ?? '']);
    setCursor(nextCursor);
  };

  const handlePreviousPage = () => {
    setCursorStack((current) => {
      const nextStack = [...current];
      const previousCursor = nextStack.pop();
      setCursor(previousCursor || undefined);
      return nextStack;
    });
  };

  const requestCount = totalPending ?? pharmacies.length;
  const footerTotal = totalPending ?? pharmacies.length;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs="Dashboard / Pharmacy Verifications"
        title="Verification Queue"
        description="Review and validate pharmacy credentials to maintain network security."
      />

      <VerificationStatsBar totalPending={totalPending} analytics={analytics} />

      <Card className="shadow-sm">
        <CardHeader className="space-y-4 border-b">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Pending Pharmacies</CardTitle>
              <CardDescription>
                Records requiring administrative review and approval.
              </CardDescription>
            </div>
            <Badge className="w-fit bg-[#014AB3]/10 text-[#014AB3] hover:bg-[#014AB3]/10">
              {requestCount} Request{requestCount === 1 ? '' : 's'}
            </Badge>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:max-w-xs">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search license or name..."
                className="h-10 bg-gray-50 pl-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              aria-label="Filter pharmacies"
              disabled
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              Loading pending pharmacies...
            </div>
          ) : pharmacies.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<CheckCircle className="h-12 w-12 text-green-500" />}
                title={debouncedSearch ? 'No matches found' : 'All caught up!'}
                description={
                  debouncedSearch
                    ? 'Try a different pharmacy name or license number.'
                    : 'No pharmacies are waiting for verification.'
                }
              />
            </div>
          ) : (
            <VerificationTable
              pharmacies={pharmacies}
              onApprove={handleApprove}
              onReject={setRejectTarget}
              approvingId={approvingId}
              isRejecting={isRejecting}
            />
          )}
        </CardContent>

        {!isLoading && pharmacies.length > 0 && (
          <div className="border-t px-4 py-4">
            <CursorPagination
              hasPrevious={cursorStack.length > 0}
              hasNext={Boolean(nextCursor)}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
              isLoading={isFetching}
              summary={`Showing ${pharmacies.length} of ${footerTotal} pending record${footerTotal === 1 ? '' : 's'}`}
            />
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
