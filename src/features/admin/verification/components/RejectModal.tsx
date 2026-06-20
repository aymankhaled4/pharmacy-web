import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const rejectSchema = z.object({
  rejection_reason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters'),
});

type RejectFormValues = z.infer<typeof rejectSchema>;

interface RejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacyName?: string;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export default function RejectModal({
  open,
  onOpenChange,
  pharmacyName,
  onConfirm,
  isLoading = false,
}: RejectModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
  });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const onSubmit = (values: RejectFormValues) => {
    onConfirm(values.rejection_reason);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={!isLoading} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Pharmacy</DialogTitle>
          <DialogDescription>
            {pharmacyName
              ? `Provide a reason for rejecting ${pharmacyName}.`
              : 'Provide a reason for rejecting this pharmacy.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejection_reason">Rejection Reason</Label>
            <Textarea
              id="rejection_reason"
              placeholder="Explain why this pharmacy cannot be approved..."
              className={cn(errors.rejection_reason && 'border-destructive')}
              {...register('rejection_reason')}
            />
            {errors.rejection_reason && (
              <p className="text-destructive text-xs">{errors.rejection_reason.message}</p>
            )}
          </div>

          <DialogFooter className="border-t-0 bg-transparent p-0 pt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? 'Rejecting...' : 'Confirm Reject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
