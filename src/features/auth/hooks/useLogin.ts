import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../core/supabase/supabase.client';
import api from '../../../core/api/axios';
import { useAuthStore } from '../../../core/auth/auth.store';
import { ENDPOINTS } from '../../../core/api/endpoints';
import type { AuthUser, UserRole } from '../../../core/auth/auth.types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RoleResponse {
  role: UserRole;
  pharmacyStatus?: string;
}

function getUserDisplayName(metadata: Record<string, unknown> | null | undefined) {
  const value =
    metadata?.name ??
    metadata?.full_name ??
    metadata?.display_name ??
    metadata?.user_name ??
    metadata?.pharmacy_name;

  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      // Step 1 — Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);

      const token = data.session.access_token;

      // Step 2 — Get role from backend
      const roleData = await api.post<unknown, RoleResponse>(ENDPOINTS.AUTH_ROLE, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Step 3 — Block pending pharmacies
      if (roleData.role === 'pharmacy' && roleData.pharmacyStatus !== 'approved') {
        throw new Error('Your pharmacy account is pending admin approval.');
      }

      return {
        token,
        role: roleData.role,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: getUserDisplayName(data.user.user_metadata),
        } as AuthUser,
      };
    },
    onSuccess: ({ token, role, user }) => {
      if (role === 'user') {
        clearAuth();
        throw new Error('This account is for patients only. Please use the mobile app.');
      }

      setAuth(token, role, user);

      if (role === 'pharmacy') navigate('/pharmacy/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    },
  });
}
