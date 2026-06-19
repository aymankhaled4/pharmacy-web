import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthStore, AuthUser, UserRole } from './auth.types';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      user: null,
      setAuth: (token: string, role: UserRole, user: AuthUser) =>
        set({ token, role, user }),
      clearAuth: () => set({ token: null, role: null, user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        user: state.user,
      }),
    }
  )
);