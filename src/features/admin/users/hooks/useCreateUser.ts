import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createAdminUser } from '../api/adminUsers.api';
import { getApiErrorMessage } from '@/lib/api-error';
import type { CreateAdminUserPayload } from '@/features/admin/types/admin.types';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => createAdminUser(payload),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(`${user.full_name} was created successfully`);
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Failed to create user');
      const lower = message.toLowerCase();

      if (lower.includes('email') && lower.includes('registered')) {
        toast.error('This email is already registered');
        return;
      }
      if (lower.includes('already exists')) {
        toast.error('This email is already registered');
        return;
      }

      toast.error(message);
    },
  });
}
