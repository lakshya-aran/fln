import { Routes, Route, Navigate } from "react-router-dom";
import { DistrictAdminLayout } from "@/components/districtadmin/DistrictAdminLayout";
import { DistrictAdminDashboardPage } from "@/pages/districtadmin/DistrictAdminDashboardPage";
import { PipelineDashboardPage } from "@/pages/districtadmin/PipelineDashboardPage";
import { BottlenecksPage } from "@/pages/districtadmin/BottlenecksPage";
import { BlocksPage } from "@/pages/districtadmin/BlocksPage";
import { SchoolsPage } from "@/pages/districtadmin/SchoolsPage";
import { BlockAdminsPage } from "@/pages/districtadmin/BlockAdminsPage";
import { AnalyticsPage } from "@/pages/districtadmin/AnalyticsPage";
import { ReportsPage } from "@/pages/districtadmin/ReportsPage";
import { NotificationsPage } from "@/pages/districtadmin/NotificationsPage";

export function DistrictAdminRouter() {
  return (
    <Routes>
      <Route element={<DistrictAdminLayout />}>
        <Route index element={<DistrictAdminDashboardPage />} />
        <Route path="pipeline" element={<PipelineDashboardPage />} />
        <Route path="bottlenecks" element={<BottlenecksPage />} />
        <Route path="blocks" element={<BlocksPage />} />
        <Route path="schools" element={<SchoolsPage />} />
        <Route path="block-admins" element={<BlockAdminsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="*" element={<Navigate to="/district" replace />} />
      </Route>
    </Routes>
  );
}