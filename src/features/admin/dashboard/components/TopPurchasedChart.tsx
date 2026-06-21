import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TopPurchasedDrug } from '../hooks/useTopPurchasedDrugs';

interface TopPurchasedChartProps {
  items: TopPurchasedDrug[];
  isLoading?: boolean;
}

function getRequestCount(item: TopPurchasedDrug) {
  return (
    item.total_requested ??
    item.total_requests ??
    item.total_orders ??
    item.request_count ??
    item.requested_count ??
    item.total_purchased ??
    item.count ??
    0
  );
}

function getMedicineName(item: TopPurchasedDrug) {
  return item.brand_name || item.name || item.drug_name || item.brand_name_ar || item.active_ingredient || 'Unknown medicine';
}

export default function TopPurchasedChart({ items, isLoading }: TopPurchasedChartProps) {
  const sortedItems = [...items].sort((a, b) => getRequestCount(b) - getRequestCount(a));
  const maxOrders = Math.max(...sortedItems.map(getRequestCount), 1);

  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-gray-200/70">
      <CardHeader>
        <CardTitle>Top Requested Medicines</CardTitle>
        <CardDescription>Most frequently booked items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[minmax(8rem,11rem)_1fr] items-center gap-4">
                <div className="h-5 animate-pulse rounded bg-gray-100" />
                <div className="h-10 animate-pulse rounded-md bg-gray-100" />
              </div>
            ))}
          </div>
        ) : sortedItems.length ? (
          <div className="space-y-5">
            {sortedItems.map((item) => {
              const value = getRequestCount(item);
              const medicineName = getMedicineName(item);
              return (
                <div
                  key={item.drug_id ?? item.id ?? medicineName}
                  className="grid grid-cols-[minmax(8rem,11rem)_1fr] items-center gap-4"
                >
                  <span className="truncate text-sm font-medium text-gray-800" title={medicineName}>
                    {medicineName}
                  </span>
                  <div className="relative h-10 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 right-0">
                      {[0, 25, 50, 75, 100].map((position) => (
                        <span
                          key={position}
                          className="absolute top-0 h-full border-l border-dashed border-gray-200"
                          style={{ left: `${position}%` }}
                        />
                      ))}
                    </div>
                    <div
                      className="relative h-full rounded-md bg-[#014AB3]"
                      style={{ width: `${Math.max((value / maxOrders) * 100, value > 0 ? 8 : 0)}%` }}
                      aria-label={`${medicineName}: ${value}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">No purchased medicine data yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
