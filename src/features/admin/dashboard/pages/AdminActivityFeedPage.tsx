import { Link } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ActivityFeedList from '../components/ActivityFeedList';
import { useActivityFeed } from '../hooks/useActivityFeed';

export default function AdminActivityFeedPage() {
  const activityFeed = useActivityFeed(20);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="link" className="mb-2 h-auto px-0 text-[#014AB3]">
            <Link to="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-950">Activity Feed</h1>
          <p className="mt-1 text-sm text-gray-500">Latest admin dashboard activities.</p>
        </div>
      </div>

      <Card className="rounded-lg border-0 bg-white shadow-sm ring-1 ring-gray-200/70">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#014AB3]" />
            Full Logs
          </CardTitle>
          <CardDescription>Showing the latest 20 activity feed items.</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-18rem)] overflow-y-auto pt-4">
          <ActivityFeedList
            items={activityFeed.data?.items ?? []}
            isLoading={activityFeed.isLoading}
            loadingItemCount={8}
          />
        </CardContent>
      </Card>

      <div className="sr-only" aria-live="polite">
        {activityFeed.isError ? 'Activity feed could not be loaded.' : 'Activity feed loaded.'}
      </div>
    </section>
  );
}
