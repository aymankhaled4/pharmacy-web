import ConfirmModal from '@/components/shared/ConfirmModal';

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteUserModal({
  open,
  onOpenChange,
  userName,
  onConfirm,
  isLoading = false,
}: DeleteUserModalProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete User"
      description={
        <div className="space-y-3 text-left">
          {userName && (
            <p>
              You are about to delete <strong>{userName}</strong>.
            </p>
          )}
          <p className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
            This action cannot be undone. All pending reservations for this user will be
            cancelled automatically.
          </p>
        </div>
      }
      confirmLabel="Delete User"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      isLoading={isLoading}
      variant="destructive"
    />
  );
}
