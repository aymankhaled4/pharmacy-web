import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActivityFeedList from '@/features/admin/dashboard/components/ActivityFeedList';
import { useActivityFeed } from '@/features/admin/dashboard/hooks/useActivityFeed';
import { cn } from '@/lib/utils';

export default function AdminNotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activityFeed = useActivityFeed(20);
  const hasItems = Boolean(activityFeed.data?.items.length);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className={cn(
          'relative rounded-full text-gray-600 hover:text-[#014AB3]',
          isOpen && 'bg-blue-50 text-[#014AB3]',
        )}
        aria-label="Notification"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell className="h-5 w-5" />
        {hasItems && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-950">Notification</h2>
          </div>
          <div className="max-h-[28rem] overflow-y-auto p-4">
            <ActivityFeedList
              items={activityFeed.data?.items ?? []}
              isLoading={activityFeed.isLoading}
              loadingItemCount={6}
              emptyMessage="No notifications yet."
            />
          </div>
        </div>
      )}
    </div>
  );
}
