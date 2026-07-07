import { Routes, Route, Navigate } from "react-router-dom";
import { StateAdminLayout } from "@/components/stateadmin/StateAdminLayout";
import { StateAdminDashboardPage } from "@/pages/stateadmin/StateAdminDashboardPage";
import { DistrictsPage } from "@/pages/stateadmin/DistrictsPage";
import { DistrictAdminsPage } from "@/pages/stateadmin/DistrictAdminsPage";
import { SchoolsPage } from "@/pages/stateadmin/SchoolsPage";
import { LockedSchoolsPage } from "@/pages/stateadmin/LockedSchoolsPage";
import { LowPerformancePage } from "@/pages/stateadmin/LowPerformancePage";
import { StateAnalyticsPage } from "@/pages/stateadmin/StateAnalyticsPage";
import { ReportsPage } from "@/pages/stateadmin/ReportsPage";

export function StateAdminRouter() {
  return (
    <Routes>
      <Route element={<StateAdminLayout />}>
        <Route index element={<StateAdminDashboardPage />} />
        <Route path="districts" element={<DistrictsPage />} />
        <Route path="districts/:id" element={<DistrictsPage />} />
        <Route path="schools" element={<SchoolsPage />} />
        <Route path="district-admins" element={<DistrictAdminsPage />} />
        <Route path="locked-schools" element={<LockedSchoolsPage />} />
        <Route path="low-performance" element={<LowPerformancePage />} />
        <Route path="analytics" element={<StateAnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}