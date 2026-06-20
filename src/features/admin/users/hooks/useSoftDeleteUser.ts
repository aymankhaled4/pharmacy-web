import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import { getApiErrorMessage } from '@/lib/api-error';

export function useSoftDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(ENDPOINTS.ADMIN_USER_BY_ID(userId), {
        data: { reason: 'Deleted by admin' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Something went wrong. Please try again.');
      if (message.toLowerCase().includes('deleted')) {
        toast.error('This user is already deleted');
        return;
      }
      if (message.toLowerCase().includes('admin')) {
        toast.error('Admin accounts cannot be deleted');
        return;
      }
      toast.error(message);
    },
  });
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      const results = await Promise.allSettled(
        userIds.map((userId) =>
          api.delete(ENDPOINTS.ADMIN_USER_BY_ID(userId), {
            data: { reason: 'Bulk deleted by admin' },
          })
        )
      );

      const succeeded = results.filter((result) => result.status === 'fulfilled').length;
      const failed = results.length - succeeded;

      return { succeeded, failed };
    },
    onSuccess: ({ succeeded, failed }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });

      if (succeeded > 0) {
        toast.success(`Deleted ${succeeded} user${succeeded === 1 ? '' : 's'}`);
      }
      if (failed > 0) {
        toast.warning(`${failed} user${failed === 1 ? '' : 's'} could not be deleted`);
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete users'));
    },
  });
}
