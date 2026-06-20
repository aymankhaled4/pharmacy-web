import { useMemo, useState } from 'react';
import { Download, Filter, Plus, Search, SlidersHorizontal } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import CursorPagination from '@/components/shared/CursorPagination';
import FilterSelect from '@/components/shared/FilterSelect';
import UsersTable from '../components/UsersTable';
import DeleteUserModal from '../components/DeleteUserModal';
import AddUserDialog from '../components/AddUserDialog';
import StatusFilterIndicator from '../components/StatusFilterIndicator';
import {
  useAdminUsers,
  type UserRoleFilter,
  type UserStatusFilter,
} from '../hooks/useAdminUsers';
import { useSoftDeleteUser, useBulkDeleteUsers } from '../hooks/useSoftDeleteUser';
import {
  useActivateUser,
  useBulkActivateUsers,
  useBulkDeactivateUsers,
  useDeactivateUser,
} from '../hooks/useUserStatusActions';
import { useExportUsers } from '../hooks/useExportUsers';
import { useCreateUser } from '../hooks/useCreateUser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AdminUser, CreateAdminUserPayload } from '@/features/admin/types/admin.types';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('active');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('all');
  const [cursor, setCursor] = useState<string | undefined>();
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);

  const { data, isLoading, isFetching } = useAdminUsers({
    status: statusFilter,
    role: roleFilter,
    cursor,
  });
  const users = data?.items ?? [];
  const nextCursor = data?.nextCursor ?? null;

  const { mutate: deleteUser, isPending: isDeleting } = useSoftDeleteUser();
  const { mutate: bulkDeleteUsers, isPending: isBulkDeleting } = useBulkDeleteUsers();
  const { mutate: activateUser } = useActivateUser();
  const { mutate: deactivateUser } = useDeactivateUser();
  const { mutate: bulkActivateUsers, isPending: isBulkActivating } = useBulkActivateUsers();
  const { mutate: bulkDeactivateUsers, isPending: isBulkDeactivating } =
    useBulkDeactivateUsers();
  const { mutate: exportUsers, isPending: isExporting } = useExportUsers();
  const { mutate: createUser, isPending: isCreatingUser } = useCreateUser();

  const isBulkBusy = isBulkDeleting || isBulkActivating || isBulkDeactivating;

  const resetPagination = () => {
    setCursor(undefined);
    setCursorStack([]);
    setSelectedIds([]);
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = Array.isArray(users) ? users : [];

    if (!query) return list;

    return list.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
    );
  }, [search, users]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aTime = a.last_login ? new Date(a.last_login).getTime() : 0;
      const bTime = b.last_login ? new Date(b.last_login).getTime() : 0;
      return bTime - aTime;
    });
  }, [filteredUsers]);

  const selectedUsers = useMemo(
    () => sortedUsers.filter((user) => selectedIds.includes(user.id)),
    [selectedIds, sortedUsers]
  );

  const canBulkActivate = selectedUsers.some((user) => user.status === 'blocked');
  const canBulkDeactivate = selectedUsers.some((user) => user.status === 'active');
  const canBulkDelete = selectedUsers.some((user) => user.status !== 'deleted');

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    setActionUserId(deleteTarget.id);
    deleteUser(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setSelectedIds((current) => current.filter((id) => id !== deleteTarget.id));
      },
      onSettled: () => setActionUserId(null),
    });
  };

  const handleActivate = (user: AdminUser) => {
    setActionUserId(user.id);
    activateUser(user.id, { onSettled: () => setActionUserId(null) });
  };

  const handleDeactivate = (user: AdminUser) => {
    setActionUserId(user.id);
    deactivateUser(user.id, { onSettled: () => setActionUserId(null) });
  };

  const handleBulkActivate = () => {
    bulkActivateUsers(selectedIds, {
      onSuccess: () => setSelectedIds([]),
    });
  };

  const handleBulkDeactivate = () => {
    bulkDeactivateUsers(selectedIds, {
      onSuccess: () => setSelectedIds([]),
    });
  };

  const handleBulkDelete = () => {
    const deletableIds = selectedUsers
      .filter((user) => user.status !== 'deleted')
      .map((user) => user.id);

    if (deletableIds.length === 0) return;

    bulkDeleteUsers(deletableIds, {
      onSuccess: () => setSelectedIds([]),
    });
  };

  const handleNextPage = () => {
    if (!nextCursor) return;
    setCursorStack((current) => [...current, cursor ?? '']);
    setCursor(nextCursor);
    setSelectedIds([]);
  };

  const handlePreviousPage = () => {
    setCursorStack((current) => {
      const nextStack = [...current];
      const previousCursor = nextStack.pop();
      setCursor(previousCursor || undefined);
      return nextStack;
    });
    setSelectedIds([]);
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? sortedUsers.map((user) => user.id) : []);
  };

  const toggleSelectOne = (userId: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? [...current, userId] : current.filter((id) => id !== userId)
    );
  };

  const handleExport = () => {
    exportUsers({
      status: statusFilter,
      role: roleFilter,
      search,
    });
  };

  const handleCreateUser = (payload: CreateAdminUserPayload) => {
    createUser(payload, {
      onSuccess: () => setAddUserOpen(false),
    });
  };

  return (
    <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage patient and admin accounts. Pharmacies are managed separately."
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                disabled={isExporting || isLoading}
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>

              <Button
                type="button"
                className="bg-[#014AB3] text-white hover:bg-[#0140a0]"
                onClick={() => setAddUserOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add New User
              </Button>
            </>
          }
        />

        <div className="rounded-xl border bg-white p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedIds([]);
                }}
                placeholder="Search users by name, email, or ID..."
                className="h-10 bg-gray-50 pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                label="Role"
                value={roleFilter}
                onChange={(value) => {
                  setRoleFilter(value as UserRoleFilter);
                  resetPagination();
                }}
                icon={<Filter className="h-4 w-4" />}
                options={[
                  { value: 'all', label: 'Role: All' },
                  { value: 'user', label: 'Role: User' },
                  { value: 'admin', label: 'Role: Admin' },
                ]}
              />

              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value as UserStatusFilter);
                  resetPagination();
                }}
                indicator={<StatusFilterIndicator status={statusFilter} />}
                options={[
                  { value: 'all', label: 'Status: All' },
                  { value: 'active', label: 'Status: Active' },
                  { value: 'blocked', label: 'Status: Blocked' },
                  { value: 'deleted', label: 'Status: Deleted' },
                ]}
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Column settings"
                disabled
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-col gap-3 rounded-xl border border-[#014AB3]/20 bg-[#014AB3]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#014AB3]">
                {selectedIds.length} User{selectedIds.length === 1 ? '' : 's'} Selected
              </p>
              <p className="text-muted-foreground text-xs">
                Select actions to apply to all checked items
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBulkActivate}
                disabled={!canBulkActivate || isBulkBusy}
              >
                Activate
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBulkDeactivate}
                disabled={!canBulkDeactivate || isBulkBusy}
              >
                Deactivate
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleBulkDelete}
                disabled={!canBulkDelete || isBulkBusy}
              >
                Delete
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[#014AB3]"
                onClick={() => setSelectedIds([])}
                disabled={isBulkBusy}
              >
                Clear selection
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-gray-400 uppercase">
            Sorted by last login — newest first
          </p>

          <UsersTable
            users={sortedUsers}
            isLoading={isLoading}
            onDelete={setDeleteTarget}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            actionUserId={actionUserId ?? (isDeleting ? deleteTarget?.id : null)}
            selectedIds={selectedIds}
            onToggleSelectAll={toggleSelectAll}
            onToggleSelectOne={toggleSelectOne}
          />
        </div>

        {!isLoading && sortedUsers.length > 0 && (
          <CursorPagination
            hasPrevious={cursorStack.length > 0}
            hasNext={Boolean(nextCursor)}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
            isLoading={isFetching}
            summary={`Showing ${sortedUsers.length} user${sortedUsers.length === 1 ? '' : 's'} on this page`}
          />
        )}

        <DeleteUserModal
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          userName={deleteTarget?.full_name}
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
        />

        <AddUserDialog
          open={addUserOpen}
          onOpenChange={setAddUserOpen}
          onSubmit={handleCreateUser}
          isLoading={isCreatingUser}
        />
      </div>
  );
}
