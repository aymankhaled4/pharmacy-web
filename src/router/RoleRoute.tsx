import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../core/auth/auth.store';
import type { UserRole } from '../core/auth/auth.types';

interface RoleRouteProps {
  allowedRole: UserRole;
}

export default function RoleRoute({ allowedRole }: RoleRouteProps) {
  const role = useAuthStore((s) => s.role);

  if (role !== allowedRole) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}