import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/format';

interface UserAvatarProps {
  name: string;
  className?: string;
}

function isUnnamedUser(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return true;

  const lower = trimmed.toLowerCase();
  return lower === 'unnamed user' || lower === 'unknown user';
}

export default function UserAvatar({ name, className }: UserAvatarProps) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#014AB3]/10 text-sm font-semibold text-[#014AB3]',
        className
      )}
    >
      {isUnnamedUser(name) ? (
        <User className="h-4 w-4" aria-hidden />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
