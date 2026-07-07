import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Building2, School, Users, Lock, AlertTriangle,
  BarChart3, FileText, LogOut, Menu, ChevronLeft, ChevronRight,
  Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/districts", label: "Districts", icon: Building2 },
  { to: "/admin/schools", label: "Schools", icon: School },
  { to: "/admin/district-admins", label: "District Admins", icon: Users },
  { to: "/admin/locked-schools", label: "Locked Schools", icon: Lock },
  { to: "/admin/low-performance", label: "Low Performance", icon: AlertTriangle },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/reports", label: "Reports", icon: FileText },
];

interface StateAdminLayoutProps {
  stateName?: string;
}

export function StateAdminLayout({ stateName }: StateAdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={cn("flex h-screen bg-gray-50", darkMode && "dark bg-gray-900")}>
      <aside
        className={cn(
          "flex flex-col border-r bg-white transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
                SA
              </div>
              <div>
                <p className="text-sm font-semibold">State Admin</p>
                <p className="text-xs text-gray-500">{stateName || "FLN Platform"}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                cn(
                  "mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-gray-700 hover:bg-gray-100",
                  collapsed && "justify-center"
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            className={cn("w-full", collapsed && "px-2")}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Menu className="h-5 w-5 text-gray-500 lg:hidden" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">State Admin Panel</h2>
              {stateName && (
                <p className="text-xs text-gray-500">{stateName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">State Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}