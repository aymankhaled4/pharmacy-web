import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/format';

interface UserAvatarProps {
  name: string;
  className?: string;
}

export default function UserAvatar({ name, className }: UserAvatarProps) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#014AB3]/10 text-sm font-semibold text-[#014AB3]',
        className
      )}
    >
      {getInitials(name || '?')}
    </div>
  );
}
