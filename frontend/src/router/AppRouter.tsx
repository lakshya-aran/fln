import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { SuperadminRouter } from "./SuperadminRouter";
import { StateAdminRouter } from "./StateAdminRouter";
import { DistrictAdminRouter } from "./DistrictAdminRouter";
import { BlockAdminRouter } from "./BlockAdminRouter";
import { ROLE_REDIRECTIONS } from "@/types";
import { useAuth } from "@/hooks/useAuth";

function PublicRoute() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === "national_admin") {
      return <Navigate to="/superadmin" replace />;
    }
    if (user.role === "state_admin") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "district_officer") {
      return <Navigate to="/district" replace />;
    }
    if (user.role === "block_officer") {
      return <Navigate to="/block" replace />;
    }
    const redirectPath = ROLE_REDIRECTIONS[user.role] || "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <LoginPage />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/teacher" element={<DashboardPage />} />
          <Route path="/dashboard/principal" element={<DashboardPage />} />
          <Route path="/dashboard/volunteer" element={<DashboardPage />} />
          <Route path="/dashboard/block" element={<Navigate to="/block" replace />} />
          <Route path="/dashboard/district" element={<Navigate to="/district" replace />} />
          <Route path="/dashboard/state" element={<Navigate to="/admin" replace />} />
          <Route path="/dashboard/national" element={<Navigate to="/superadmin" replace />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["national_admin"]} />}>
        <Route path="/superadmin/*" element={<SuperadminRouter />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["state_admin"]} />}>
        <Route path="/admin/*" element={<StateAdminRouter />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["district_officer"]} />}>
        <Route path="/district/*" element={<DistrictAdminRouter />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["block_officer"]} />}>
        <Route path="/block/*" element={<BlockAdminRouter />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
