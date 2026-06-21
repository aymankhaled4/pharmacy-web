import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmModalVariant = 'default' | 'destructive';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  /** Alias for confirmLabel (reservations module) */
  confirmText?: string;
  cancelLabel?: string;
  /** Alias for cancelLabel (reservations module) */
  cancelText?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: ConfirmModalVariant;
  /** Alias for variant (reservations module) */
  confirmVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
}

function resolveConfirmButtonProps(
  variant?: ConfirmModalVariant,
  confirmVariant?: ConfirmModalProps['confirmVariant']
) {
  if (variant === 'default') {
    return {
      variant: 'default' as const,
      className: 'bg-[#014AB3] text-white hover:bg-[#0140a0]',
    };
  }

  if (variant === 'destructive') {
    return { variant: 'destructive' as const, className: undefined };
  }

  if (confirmVariant === 'default') {
    return {
      variant: 'default' as const,
      className: 'bg-[#014AB3] text-white hover:bg-[#0140a0]',
    };
  }

  if (confirmVariant === 'destructive') {
    return { variant: 'destructive' as const, className: undefined };
  }

  if (confirmVariant) {
    return { variant: confirmVariant, className: undefined };
  }

  return { variant: 'destructive' as const, className: undefined };
}

export default function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  onConfirm,
  isLoading = false,
  variant,
  confirmVariant,
}: ConfirmModalProps) {
  const resolvedConfirmLabel = confirmLabel ?? confirmText ?? 'Confirm';
  const resolvedCancelLabel = cancelLabel ?? cancelText ?? 'Cancel';
  const confirmButton = resolveConfirmButtonProps(variant, confirmVariant);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isLoading} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="mx-0 mb-0 mt-2 gap-3 border-t border-gray-100 bg-transparent px-0 pt-5 pb-0 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {resolvedCancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmButton.variant}
            className={confirmButton.className}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : resolvedConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
