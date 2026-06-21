import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../core/auth/auth.store';

export default function AuthLayout() {
  const { token, role } = useAuthStore();

  // Already logged in — redirect away from auth pages
  if (token && role === 'pharmacy') return <Navigate to="/pharmacy/inventory" replace />;
  if (token && role === 'admin') return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="bg-muted/40 min-h-screen">
      <Outlet />
    </div>
  );
}