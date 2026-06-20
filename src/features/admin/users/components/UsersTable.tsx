import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  CheckCircle2,
  MoreVertical,
  Trash2,
  XCircle,
} from 'lucide-react';
import UserAvatar from '@/components/shared/UserAvatar';
import UserStatusBadge from './UserStatusBadge';
import UserRoleBadge from './UserRoleBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatLastLogin, formatRoleTag } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/features/admin/types/admin.types';

interface UsersTableProps {
  users: AdminUser[];
  isLoading?: boolean;
  onDelete: (user: AdminUser) => void;
  onActivate: (user: AdminUser) => void;
  onDeactivate: (user: AdminUser) => void;
  actionUserId?: string | null;
  selectedIds?: string[];
  onToggleSelectAll?: (checked: boolean) => void;
  onToggleSelectOne?: (userId: string, checked: boolean) => void;
}

const headerClassName =
  'px-4 py-3 text-[11px] font-semibold tracking-[0.08em] text-gray-400 uppercase';

export default function UsersTable({
  users,
  isLoading,
  onDelete,
  onActivate,
  onDeactivate,
  actionUserId,
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelectOne,
}: UsersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      { id: 'name', label: 'Name & Role' },
      { id: 'email', label: 'Email Address' },
      { id: 'role', label: 'Role' },
      { id: 'status', label: 'Status' },
      { id: 'lastLogin', label: 'Last Login' },
      { id: 'actions', label: 'Actions' },
    ],
    []
  );

  const allSelected = users.length > 0 && users.every((user) => selectedIds.includes(user.id));

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white px-6 py-16 text-center text-sm text-muted-foreground">
        Loading users...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border bg-white px-6 py-16 text-center text-sm text-muted-foreground">
        No users found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-gray-50/80 hover:bg-gray-50/80">
            <TableHead className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) => onToggleSelectAll?.(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#014AB3] focus:ring-[#014AB3]/20"
                aria-label="Select all users"
              />
            </TableHead>
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  headerClassName,
                  column.id === 'actions' && 'text-right',
                  column.id === 'lastLogin' && 'min-w-[10rem]'
                )}
              >
                <div
                  className={cn(
                    'flex items-center gap-1.5',
                    column.id === 'actions' && 'justify-end'
                  )}
                >
                  {column.label}
                  {column.id === 'lastLogin' && (
                    <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => {
            const isSelected = selectedIds.includes(user.id);
            const isInactive = user.status === 'blocked' || user.status === 'deleted';
            const isBusy = actionUserId === user.id;

            return (
              <TableRow
                key={user.id}
                className={cn(
                  'border-b last:border-b-0',
                  isSelected && 'bg-[#014AB3]/5 hover:bg-[#014AB3]/8',
                  !isSelected &&
                    user.status === 'blocked' &&
                    'bg-red-50/40 hover:bg-red-50/50',
                  !isSelected &&
                    user.status === 'deleted' &&
                    'bg-gray-50/80 hover:bg-gray-50'
                )}
              >
                <TableCell className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(event) =>
                      onToggleSelectOne?.(user.id, event.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-[#014AB3] focus:ring-[#014AB3]/20"
                    aria-label={`Select ${user.full_name}`}
                  />
                </TableCell>

                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={user.full_name} />
                    <div>
                      <p
                        className={cn(
                          'font-semibold text-gray-900',
                          isInactive && 'text-muted-foreground line-through'
                        )}
                      >
                        {user.full_name}
                      </p>
                      <p className="text-[11px] font-medium tracking-[0.08em] text-gray-400 uppercase">
                        {formatRoleTag(user.role)}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-4">
                  <span className="text-sm text-gray-700">{user.email || '—'}</span>
                </TableCell>

                <TableCell className="px-4 py-4">
                  <UserRoleBadge role={user.role} />
                </TableCell>

                <TableCell className="px-4 py-4">
                  <UserStatusBadge status={user.status} />
                </TableCell>

                <TableCell className="px-4 py-4">
                  <span className="text-sm text-gray-700">
                    {formatLastLogin(user.last_login)}
                  </span>
                </TableCell>

                <TableCell className="relative px-4 py-4 text-right">
                  {user.status === 'deleted' ? (
                    <span className="text-muted-foreground text-sm">—</span>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-gray-500 hover:text-gray-900"
                        onClick={() =>
                          setOpenMenuId((current) => (current === user.id ? null : user.id))
                        }
                        disabled={isBusy}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {openMenuId === user.id && (
                        <>
                          <button
                            type="button"
                            aria-label="Close actions menu"
                            className="fixed inset-0 z-10 cursor-default"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute top-10 right-4 z-20 min-w-40 rounded-lg border bg-white py-1 shadow-lg">
                            {user.status === 'blocked' && (
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onActivate(user);
                                }}
                                disabled={isBusy}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Activate
                              </button>
                            )}

                            {user.status === 'active' && (
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onDeactivate(user);
                                }}
                                disabled={isBusy}
                              >
                                <XCircle className="h-4 w-4 text-amber-600" />
                                Deactivate
                              </button>
                            )}

                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setOpenMenuId(null);
                                onDelete(user);
                              }}
                              disabled={isBusy}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
