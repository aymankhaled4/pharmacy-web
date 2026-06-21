import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuthStore } from '../../core/auth/auth.store';
import { supabase } from '../../core/supabase/supabase.client';

interface TopbarProps {
  onOpenSidebar?: () => void;
  fallbackName?: string;
  showSearch?: boolean;
  notificationDropdown?: ReactNode;
}

function toTitleName(email?: string | null, fallbackName = 'Admin User') {
  if (!email) return fallbackName;

  return email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || fallbackName;
}

function getMetadataName(metadata: Record<string, unknown> | null | undefined) {
  const value =
    metadata?.name ??
    metadata?.full_name ??
    metadata?.display_name ??
    metadata?.user_name ??
    metadata?.pharmacy_name;

  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export default function Topbar({
  onOpenSidebar,
  fallbackName = 'Admin User',
  notificationDropdown,
}: TopbarProps) {
  const user = useAuthStore((state) => state.user);
  const [metadataName, setMetadataName] = useState<string | undefined>(user?.name);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      setMetadataName(getMetadataName(data.user?.user_metadata));
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = useMemo(
  () => fallbackName !== 'Admin User' ? fallbackName : (user?.name || metadataName || toTitleName(user?.email, fallbackName)),
  [fallbackName, metadataName, user?.email, user?.name]
  );
  const initial = displayName.trim().charAt(0).toUpperCase() || 'A';

  return (
    <header className="sticky top-0 z-20 border-b bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border text-gray-600 transition-colors hover:bg-gray-50 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3">
          {notificationDropdown ?? (
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:text-[#014AB3]"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
          )}

          <div className="flex min-w-0 items-center gap-3">
            <span className="max-w-36 truncate text-sm font-medium text-gray-700 sm:max-w-52">
              {displayName}
            </span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#014AB3] text-sm font-semibold text-white">
              {initial}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
