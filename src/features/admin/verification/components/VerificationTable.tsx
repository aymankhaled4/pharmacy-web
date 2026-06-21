import { Building2, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AdminPharmacy } from '@/features/admin/types/admin.types';

interface VerificationTableProps {
  pharmacies: AdminPharmacy[];
  onApprove: (pharmacyId: string) => void;
  onReject: (pharmacy: AdminPharmacy) => void;
  approvingId?: string | null;
  isRejecting?: boolean;
}

const headerClassName =
  'px-4 py-3 text-[11px] font-semibold tracking-[0.08em] text-gray-400 uppercase';

function formatPharmacyAddress(pharmacy: AdminPharmacy): string {
  const parts = [pharmacy.address, pharmacy.city].filter(Boolean);
  return parts.join(', ') || '—';
}

export default function VerificationTable({
  pharmacies,
  onApprove,
  onReject,
  approvingId,
  isRejecting = false,
}: VerificationTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b bg-gray-50/80 hover:bg-gray-50/80">
          <TableHead className={headerClassName}>Pharmacy Details</TableHead>
          <TableHead className={headerClassName}>License Number</TableHead>
          <TableHead className={headerClassName}>Submitted</TableHead>
          <TableHead className={cn(headerClassName, 'text-right')}>Verification</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pharmacies.map((pharmacy) => {
          const isBusy = isRejecting || approvingId === pharmacy.id;

          return (
            <TableRow key={pharmacy.id}>
              <TableCell className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{pharmacy.pharmacy_name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatPharmacyAddress(pharmacy)}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-700">
                    {pharmacy.license_number || '—'}
                  </span>
                  <Clock3 className="h-3.5 w-3.5 text-gray-300" aria-hidden />
                </div>
              </TableCell>

              <TableCell className="px-4 py-4">
                <span className="text-sm text-gray-600">
                  {formatRelativeTime(pharmacy.created_at)}
                </span>
              </TableCell>

              <TableCell className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto px-0 text-red-600 hover:bg-transparent hover:text-red-700"
                    onClick={() => onReject(pharmacy)}
                    disabled={isBusy}
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#014AB3] text-white hover:bg-[#0140a0]"
                    onClick={() => onApprove(pharmacy.id)}
                    disabled={isBusy}
                  >
                    {approvingId === pharmacy.id ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
