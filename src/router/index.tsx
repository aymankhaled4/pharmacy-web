import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import AuthLayout from '../layouts/AuthLayout';
import PharmacyLayout from '../layouts/PharmacyLayout';
import AdminLayout from '../layouts/AdminLayout';

import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPharmacyPage from '../features/auth/pages/RegisterPharmacyPage';

// Pharmacy pages — placeholders until teammates build them
import PharmacyDashboardPage from '@/features/pharmacy/dashboard/pages/PharmacyDashboardPage';


// Admin pages — placeholders until teammates build them
import AdminDashboardPage from '@/features/admin/dashboard/pages/AdminDashboardPage';
import PharmaciesPage from '@/features/admin/pharmacies/pages/PharmaciesPage';
import UsersPage from '@/features/admin/users/pages/UsersPage';
import AllReservationsPage from '@/features/admin/reservations/pages/AllReservationsPage';

function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground text-lg">
        You are not authorized to view this page.
      </p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground text-lg">404 — Page not found.</p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPharmacyPage />} />
      </Route>

      {/* Pharmacy */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRole="pharmacy" />}>
          <Route element={<PharmacyLayout />}>
            <Route path="/pharmacy/dashboard" element={<PharmacyDashboardPage />} />
          </Route>
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/pharmacies" element={<PharmaciesPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/reservations" element={<AllReservationsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
