import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Package, ClipboardList, User, LogOut, X } from "lucide-react";
import { useAuthStore } from "../core/auth/auth.store";
import { supabase } from "../core/supabase/supabase.client";
import Topbar from "../components/shared/Topbar";
import logo from "../assets/Dawak_logo.png";
import { cn } from "../lib/utils";
import PharmacyNotificationsDropdown from "../features/pharmacy/notifications/components/PharmacyNotificationsDropdown";
import { usePharmacyProfile } from "../features/pharmacy/profile/hooks/useUpdateProfile";

const navItems = [
  { to: "/pharmacy/inventory", icon: Package, label: "Inventory" },
  { to: "/pharmacy/reservations", icon: ClipboardList, label: "Reservations" },
  { to: "/pharmacy/profile", icon: User, label: "Profile" },
];

export default function PharmacyLayout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: profile } = usePharmacyProfile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAuth();
    navigate("/login", { replace: true });
  };

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b px-6">
        <img src={logo} alt="Dawak" className="h-20 w-auto" />
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Close navigation">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setIsSidebarOpen(false)}
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

      <div className="border-t p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-white lg:flex">
        {sidebarContent}
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <aside className="relative flex h-full w-72 max-w-[82vw] flex-col border-r bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          fallbackName={profile?.pharmacy_name ?? "Pharmacy User"}
          notificationDropdown={<PharmacyNotificationsDropdown />}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
