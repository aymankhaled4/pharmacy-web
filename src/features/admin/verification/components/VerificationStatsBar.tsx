import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
} from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';
import type { AdminPharmacy, AnalyticsOverview } from '@/features/admin/types/admin.types';

interface VerificationStatsBarProps {
  pharmacies: AdminPharmacy[];
  analytics?: AnalyticsOverview;
}

export default function VerificationStatsBar({
  pharmacies,
  analytics,
}: VerificationStatsBarProps) {
  const queueSize = pharmacies.length;
  const todaysApprovals = analytics?.todays_approvals ?? '—';
  const recentRejections = analytics?.recent_rejections ?? '—';
  const avgReviewTime =
    analytics?.avg_review_time_hours != null
      ? `${analytics.avg_review_time_hours}h`
      : '—';

  const approvalRate =
    analytics?.approval_rate != null ? `${analytics.approval_rate}% approval rate` : undefined;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        label="Queue Size"
        value={queueSize}
        hint={queueSize > 0 ? `${queueSize} pending review` : 'No pending requests'}
        icon={<Clock3 className="h-5 w-5" />}
        iconClassName="bg-[#014AB3]/10 text-[#014AB3]"
      />
      <StatsCard
        label="Today's Approvals"
        value={todaysApprovals}
        hint={approvalRate}
        hintClassName="text-green-600"
        icon={<CheckCircle2 className="h-5 w-5" />}
        iconClassName="bg-green-50 text-green-600"
      />
      <StatsCard
        label="Recent Rejections"
        value={recentRejections}
        hint="Flagged for document errors"
        hintClassName="text-red-600"
        icon={<XCircle className="h-5 w-5" />}
        iconClassName="bg-red-50 text-red-600"
      />
      <StatsCard
        label="Avg. Review Time"
        value={avgReviewTime}
        hint="Within SLA target"
        icon={<AlertCircle className="h-5 w-5" />}
        iconClassName="bg-violet-50 text-violet-600"
      />
    </div>
  );
}
