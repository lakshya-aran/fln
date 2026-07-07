import { Routes, Route, Navigate } from "react-router-dom";
import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";
import { SuperadminDashboardPage } from "@/pages/superadmin/SuperadminDashboardPage";
import { AdminManagementPage } from "@/pages/superadmin/AdminManagementPage";
import { AssessmentCalendarPage } from "@/pages/superadmin/AssessmentCalendarPage";
import { CurriculumPage } from "@/pages/superadmin/CurriculumPage";
import { QuestionReviewPage } from "@/pages/superadmin/QuestionReviewPage";
import { VisualAssetsPage } from "@/pages/superadmin/VisualAssetsPage";
import { FeedbackPage } from "@/pages/superadmin/FeedbackPage";
import { AnnouncementPage } from "@/pages/superadmin/AnnouncementPage";
import { SchoolRecoveryPage } from "@/pages/superadmin/SchoolRecoveryPage";
import { AnalyticsPage } from "@/pages/superadmin/AnalyticsPage";
import { AuditLogsPage } from "@/pages/superadmin/AuditLogsPage";

export function SuperadminRouter() {
  return (
    <Routes>
      <Route element={<SuperAdminLayout />}>
        <Route index element={<SuperadminDashboardPage />} />
        <Route path="admins" element={<AdminManagementPage />} />
        <Route path="calendar" element={<AssessmentCalendarPage />} />
        <Route path="curriculum" element={<CurriculumPage />} />
        <Route path="question-review" element={<QuestionReviewPage />} />
        <Route path="visual-assets" element={<VisualAssetsPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="announcements" element={<AnnouncementPage />} />
        <Route path="school-recovery" element={<SchoolRecoveryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="audit" element={<AuditLogsPage />} />
        <Route path="*" element={<Navigate to="/superadmin" replace />} />
      </Route>
    </Routes>
  );
}