import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: 'blue' | 'cyan' | 'green' | 'amber';
  change?: string;
  note?: string;
}

const toneStyles = {
  blue: 'bg-blue-50 text-blue-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
};

export default function KpiCard({
  title,
  value,
  icon: Icon,
  tone = 'blue',
  change,
  note,
}: KpiCardProps) {
  return (
    <Card className="rounded-lg border-0 bg-white shadow-sm ring-1 ring-gray-200/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', toneStyles[tone])}>
            <Icon className="h-5 w-5" />
          </div>

          {change && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
              <ArrowUpRight className="h-3 w-3" />
              {change}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-950">{value}</p>
          {note && <p className="text-xs text-gray-500">{note}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
