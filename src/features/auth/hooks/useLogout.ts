import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../core/supabase/supabase.client';
import { useAuthStore } from '../../../core/auth/auth.store';

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => supabase.auth.signOut(),
    onSuccess: () => {
      clearAuth();
      navigate('/login', { replace: true });
    },
  });
}