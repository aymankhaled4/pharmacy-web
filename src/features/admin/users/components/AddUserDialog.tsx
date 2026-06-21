import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CreateAdminUserPayload } from '@/features/admin/types/admin.types';

const EGYPTIAN_PHONE_REGEX = /^01[0-9]{9}$/;

const addUserSchema = z
  .object({
    full_name: z.string().trim().min(1, 'Full name is required'),
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['user', 'admin']),
    phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const phone = data.phone?.trim();
    if (data.role === 'user' && phone && !EGYPTIAN_PHONE_REGEX.test(phone)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid Egyptian phone number (e.g. 01012345678)',
        path: ['phone'],
      });
    }
  });

type AddUserFormValues = z.infer<typeof addUserSchema>;

const defaultValues: AddUserFormValues = {
  full_name: '',
  email: '',
  password: '',
  role: 'user',
  phone: '',
};

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateAdminUserPayload) => void;
  isLoading?: boolean;
}

export default function AddUserDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: AddUserDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues,
  });

  const role = useWatch({ control, name: 'role' });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) reset(defaultValues);
    onOpenChange(nextOpen);
  };

  const handleFormSubmit = (values: AddUserFormValues) => {
    onSubmit({
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role,
      ...(values.role === 'user' && values.phone?.trim()
        ? { phone: values.phone.trim() }
        : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={!isLoading} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a patient or admin account. The account will be active immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="Ahmed Hassan"
              autoComplete="name"
              className={cn(errors.full_name && 'border-destructive')}
              {...register('full_name')}
            />
            {errors.full_name && (
              <p className="text-destructive text-xs">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              autoComplete="off"
              className={cn(errors.email && 'border-destructive')}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              className={cn(errors.password && 'border-destructive')}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="relative">
              <select
                id="role"
                className={cn(
                  'flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none',
                  errors.role && 'border-destructive'
                )}
                {...register('role')}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.role && (
              <p className="text-destructive text-xs">{errors.role.message}</p>
            )}
          </div>

          {role === 'user' && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <div className="relative">
                <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01012345678"
                  autoComplete="tel"
                  className={cn('pl-9', errors.phone && 'border-destructive')}
                  {...register('phone')}
                />
              </div>
              {errors.phone && (
                <p className="text-destructive text-xs">{errors.phone.message}</p>
              )}
            </div>
          )}

          <DialogFooter className="mx-0 mb-0 mt-2 gap-3 border-t border-gray-100 bg-transparent px-0 pt-5 pb-0 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#014AB3] text-white hover:bg-[#0140a0]"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
