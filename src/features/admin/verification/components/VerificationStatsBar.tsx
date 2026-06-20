import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
} from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';
import type { AnalyticsOverview } from '@/features/admin/types/admin.types';

interface VerificationStatsBarProps {
  totalPending?: number | null;
  analytics?: AnalyticsOverview;
}

function formatQueueHint(analytics?: AnalyticsOverview, totalPending?: number | null): string {
  if (
    analytics?.pending_pharmacies_delta != null &&
    analytics.pending_pharmacies_delta_label
  ) {
    const prefix = analytics.pending_pharmacies_delta >= 0 ? '+' : '';
    return `${prefix}${analytics.pending_pharmacies_delta} ${analytics.pending_pharmacies_delta_label}`;
  }

  const count = analytics?.pending_pharmacies ?? totalPending ?? 0;
  return count > 0 ? `${count} pending review` : 'No pending requests';
}

export default function VerificationStatsBar({
  totalPending,
  analytics,
}: VerificationStatsBarProps) {
  const queueSize = analytics?.pending_pharmacies ?? totalPending ?? '—';
  const todaysApprovals = analytics?.todays_approvals ?? '—';
  const recentRejections = analytics?.recent_rejections ?? '—';
  const avgReviewTime =
    analytics?.avg_review_time_hours != null
      ? `${analytics.avg_review_time_hours}h`
      : '—';

  const approvalRate =
    analytics?.approval_rate != null
      ? `${analytics.approval_rate}% approval rate`
      : undefined;

  const queueHint = formatQueueHint(analytics, totalPending);
  const queueHintClassName =
    analytics?.pending_pharmacies_delta != null &&
    analytics.pending_pharmacies_delta_label
      ? 'text-green-600'
      : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        label="Queue Size"
        value={queueSize}
        hint={queueHint}
        hintClassName={queueHintClassName}
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
