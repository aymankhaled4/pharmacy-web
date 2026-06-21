import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../core/auth/auth.store";
import { supabase } from "../core/supabase/supabase.client";
import logo from "../assets/Dawak_logo.png";
import icon from "../assets/Dawak_icon.png";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/pharmacy/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/pharmacy/inventory", icon: Package, label: "Inventory" },
  { to: "/pharmacy/reservations", icon: ClipboardList, label: "Reservations" },
  { to: "/pharmacy/notifications", icon: Bell, label: "Notifications" },
  { to: "/pharmacy/profile", icon: User, label: "Profile" },
];

export default function PharmacyLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <img src={logo} alt="Dawak" className="h-8 w-auto" />
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#014AB3] text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )
              }>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <div />
          <div className="flex items-center gap-3">
            <img src={icon} alt="" className="h-8 w-8 rounded-full" />
            <span className="text-sm font-medium text-gray-700">
              {user?.email}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
