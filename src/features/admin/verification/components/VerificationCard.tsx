import { Building2, CalendarDays, Clock3, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDate, formatRelativeTime } from '@/lib/format';
import type { AdminPharmacy } from '@/features/admin/types/admin.types';

interface VerificationCardProps {
  pharmacy: AdminPharmacy;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export default function VerificationCard({
  pharmacy,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: VerificationCardProps) {
  const isBusy = isApproving || isRejecting;

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#014AB3]/10 text-[#014AB3]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {pharmacy.pharmacy_name}
              </h3>
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                {pharmacy.address}, {pharmacy.city}
              </p>
            </div>
          </div>
          <Badge className="w-fit bg-amber-50 text-amber-700 hover:bg-amber-50">
            Pending
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="text-muted-foreground h-4 w-4" />
            {pharmacy.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <ShieldCheck className="text-muted-foreground h-4 w-4" />
            License: {pharmacy.license_number}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CalendarDays className="text-muted-foreground h-4 w-4" />
            Registered: {formatDate(pharmacy.created_at)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock3 className="text-muted-foreground h-4 w-4" />
            Submitted {formatRelativeTime(pharmacy.created_at)}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
          onClick={() => onReject(pharmacy.id)}
          disabled={isBusy}
        >
          Reject
        </Button>
        <Button
          type="button"
          className="w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto"
          onClick={() => onApprove(pharmacy.id)}
          disabled={isBusy}
        >
          {isApproving ? 'Approving...' : 'Approve'}
        </Button>
      </CardFooter>
    </Card>
  );
}
