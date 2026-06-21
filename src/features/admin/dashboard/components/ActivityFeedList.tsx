import { Activity, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityFeedItem, ActivitySeverity } from '../hooks/useActivityFeed';

interface ActivityFeedListProps {
  items: ActivityFeedItem[];
  isLoading?: boolean;
  loadingItemCount?: number;
  emptyMessage?: string;
}

const severityConfig: Record<
  ActivitySeverity,
  {
    icon: typeof Activity;
    tone: string;
  }
> = {
  info: {
    icon: Activity,
    tone: 'bg-blue-50 text-[#014AB3]',
  },
  success: {
    icon: CheckCircle2,
    tone: 'bg-emerald-50 text-emerald-600',
  },
  warning: {
    icon: AlertCircle,
    tone: 'bg-amber-50 text-amber-600',
  },
  danger: {
    icon: XCircle,
    tone: 'bg-red-50 text-red-600',
  },
};

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function ActivityFeedList({
  items,
  isLoading,
  loadingItemCount = 4,
  emptyMessage = 'No recent activity yet.',
}: ActivityFeedListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: loadingItemCount }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-100" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <p className="py-4 text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const config = severityConfig[item.severity] ?? severityConfig.info;
        const Icon = config.icon;
        const createdAt = item.createdAt ?? item.created_at;

        return (
          <div key={`${item.type}-${item.id}-${createdAt ?? 'no-time'}`} className="flex gap-3">
            <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', config.tone)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-950">{item.title}</span> {item.message}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {createdAt ? formatRelativeTime(createdAt) : 'Time unavailable'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
