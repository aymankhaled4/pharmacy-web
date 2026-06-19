export type UserRole = 'pharmacy' | 'admin' | 'user';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthStore {
  token: string | null;
  role: UserRole | null;
  user: AuthUser | null;
  setAuth: (token: string, role: UserRole, user: AuthUser) => void;
  clearAuth: () => void;
}