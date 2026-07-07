import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, GitBranch, AlertTriangle, Building2, School,
  Users, BarChart3, FileText, Bell, LogOut, Menu, ChevronLeft,
  ChevronRight, Sun, Moon,
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
  { to: "/district", label: "Dashboard", icon: LayoutDashboard },
  { to: "/district/pipeline", label: "Pipeline", icon: GitBranch },
  { to: "/district/bottlenecks", label: "Bottlenecks", icon: AlertTriangle },
  { to: "/district/blocks", label: "Blocks", icon: Building2 },
  { to: "/district/schools", label: "Schools", icon: School },
  { to: "/district/block-admins", label: "Block Admins", icon: Users },
  { to: "/district/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/district/reports", label: "Reports", icon: FileText },
  { to: "/district/notifications", label: "Notifications", icon: Bell },
];

export function DistrictAdminLayout() {
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
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
                DA
              </div>
              <div>
                <p className="text-sm font-semibold">District Admin</p>
                <p className="text-xs text-gray-500">FLN Platform</p>
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
              end={item.to === "/district"}
              className={({ isActive }) =>
                cn(
                  "mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-600 text-white"
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
            className={cn("w-full gap-2", collapsed && "px-2")}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Menu className="h-5 w-5 text-gray-500 lg:hidden" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">District Admin Panel</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">District Admin</p>
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
