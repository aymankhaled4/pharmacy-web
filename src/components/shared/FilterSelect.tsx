import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  icon?: ReactNode;
  indicator?: ReactNode;
  className?: string;
}

export default function FilterSelect({
  label,
  value,
  options,
  onChange,
  icon,
  indicator,
  className,
}: FilterSelectProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <div
      className={cn(
        'relative flex h-10 min-w-38 items-center gap-2 rounded-lg border border-gray-200 bg-white pl-3 pr-8',
        className
      )}
    >
      {icon && <span className="text-gray-500">{icon}</span>}
      {indicator}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="w-full appearance-none bg-transparent text-sm text-gray-700 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <span className="sr-only">
        {label}: {selected?.label}
      </span>
    </div>
  );
}
