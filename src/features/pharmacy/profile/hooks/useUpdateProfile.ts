import api from '@/core/api/axios';
import { ENDPOINTS } from '@/core/api/endpoints';
import { supabase } from '@/core/supabase/supabase.client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

export interface PharmacyProfile {
  id: string;
  pharmacy_name: string;
  phone: string;
  address: string;
  city: string;
  license_number: string;
  status: string;
}

export function usePharmacyProfile() {
  return useQuery({
    queryKey: ['pharmacy-profile'],
    queryFn: () => api.get<unknown, PharmacyProfile>(ENDPOINTS.PHARMACY_ME),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Pick<PharmacyProfile, 'pharmacy_name' | 'phone' | 'address' | 'city'>>) =>
      api.patch(ENDPOINTS.PHARMACY_ME, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-profile'] });
      toast.success('Profile updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update profile.');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Password changed successfully.');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to change password.');
    },
  });
}