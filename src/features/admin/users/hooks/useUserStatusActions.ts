import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import { getApiErrorMessage } from '@/lib/api-error';
import type { BulkUserStatusResult } from '@/features/admin/types/admin.types';

function invalidateUsers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['admin-users'] });
}

function showBulkResult(action: string, result: BulkUserStatusResult) {
  if (result.updated_count > 0) {
    toast.success(`${action} ${result.updated_count} user${result.updated_count === 1 ? '' : 's'}`);
  }

  if (result.failed_ids.length > 0) {
    toast.warning(
      `${result.failed_ids.length} user${result.failed_ids.length === 1 ? '' : 's'} could not be updated`
    );
  }

  if (result.updated_count === 0 && result.failed_ids.length === 0) {
    toast.info('No users were updated');
  }
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => api.post(ENDPOINTS.ADMIN_USER_ACTIVE(userId)),
    onSuccess: () => {
      invalidateUsers(queryClient);
      toast.success('User activated successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to activate user'));
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => api.post(ENDPOINTS.ADMIN_USER_INACTIVE(userId)),
    onSuccess: () => {
      invalidateUsers(queryClient);
      toast.success('User deactivated successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to deactivate user'));
    },
  });
}

export function useBulkActivateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      const result = await api.post(ENDPOINTS.ADMIN_USERS_BULK_ACTIVE, {
        user_ids: userIds,
      });
      return result as unknown as BulkUserStatusResult;
    },
    onSuccess: (result) => {
      invalidateUsers(queryClient);
      showBulkResult('Activated', result);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to activate users'));
    },
  });
}

export function useBulkDeactivateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      const result = await api.post(ENDPOINTS.ADMIN_USERS_BULK_INACTIVE, {
        user_ids: userIds,
      });
      return result as unknown as BulkUserStatusResult;
    },
    onSuccess: (result) => {
      invalidateUsers(queryClient);
      showBulkResult('Deactivated', result);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to deactivate users'));
    },
  });
}
