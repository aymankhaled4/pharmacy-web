import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NearExpiryBadgeProps {
  expiryDate?: string;
  className?: string;
}

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function NearExpiryBadge({
  expiryDate,
  className,
}: NearExpiryBadgeProps) {
  if (!expiryDate) return null;

  const days = getDaysUntilExpiry(expiryDate);

  if (days < 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600",
          className,
        )}>
        <AlertTriangle className="h-3 w-3" />
        Expired
      </span>
    );
  }

  if (days <= 90) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-600",
          className,
        )}>
        <AlertTriangle className="h-3 w-3" />
        Near Expiry
      </span>
    );
  }

  return null;
}
