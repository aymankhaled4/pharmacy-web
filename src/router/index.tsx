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