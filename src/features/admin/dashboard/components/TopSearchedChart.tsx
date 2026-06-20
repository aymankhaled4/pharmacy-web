import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TopSearchedDrug } from '../hooks/useTopSearchedDrugs';

interface TopSearchedChartProps {
  items: TopSearchedDrug[];
  isLoading?: boolean;
}

function getDisplayName(item: TopSearchedDrug): string {
  return (
    item.label ||
    item.generic_name ||
    item.resolved_ingredient ||
    item.brand_name ||
    item.active_ingredient ||
    'Unknown'
  );
}

function getCount(item: TopSearchedDrug): number {
  return item.search_count ?? item.request_count ?? 0;
}

export default function TopSearchedChart({ items, isLoading }: TopSearchedChartProps) {
  const counts = items.map(getCount);
  const maxSearches = Math.max(...counts, 1);

  return (
    <Card className="rounded-lg border-0 bg-white shadow-sm ring-1 ring-gray-200/70">
      <CardHeader>
        <CardTitle>Top Searched Medicines</CardTitle>
        <CardDescription>Search demand from patients</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-8 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : items.length ? (
          items.map((item, idx) => {
            const name = getDisplayName(item);
            const count = getCount(item);
            return (
              <div
                key={item.drug_id ?? item.resolved_ingredient ?? idx}
                className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-xs"
              >
                <span className="truncate font-medium text-gray-700">{name}</span>
                <div className="h-8 overflow-hidden rounded-sm bg-cyan-50">
                  <div
                    className="h-full rounded-sm bg-cyan-500"
                    style={{ width: `${Math.max((count / maxSearches) * 100, 8)}%` }}
                  />
                </div>
                <span className="text-right font-semibold text-gray-600">{count}</span>
              </div>
            );
          })
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">No search analytics yet.</p>
        )}
      </CardContent>
    </Card>
  );
}