import { Routes, Route, Navigate } from "react-router-dom";
import { BlockAdminLayout } from "@/components/blockadmin/BlockAdminLayout";
import { BlockAdminDashboardPage } from "@/pages/blockadmin/BlockAdminDashboardPage";
import { VolunteersPage } from "@/pages/blockadmin/VolunteersPage";
import { AssignmentsPage } from "@/pages/blockadmin/AssignmentsPage";
import { QuestionPapersPage } from "@/pages/blockadmin/QuestionPapersPage";
import { PrintingPage } from "@/pages/blockadmin/PrintingPage";
import { AssessmentSchedulingPage } from "@/pages/blockadmin/AssessmentSchedulingPage";
import { AssessmentPipelinePage } from "@/pages/blockadmin/AssessmentPipelinePage";
import { BlockSchoolsPage } from "@/pages/blockadmin/BlockSchoolsPage";
import { StudentRegistrationsPage } from "@/pages/blockadmin/StudentRegistrationsPage";
import { LockedSchoolsPage } from "@/pages/blockadmin/LockedSchoolsPage";
import { BlockAnalyticsPage } from "@/pages/blockadmin/BlockAnalyticsPage";
import { BlockReportsPage } from "@/pages/blockadmin/BlockReportsPage";
import { BlockNotificationsPage } from "@/pages/blockadmin/BlockNotificationsPage";

export function BlockAdminRouter() {
  return (
    <Routes>
      <Route element={<BlockAdminLayout />}>
        <Route index element={<BlockAdminDashboardPage />} />
        <Route path="volunteers" element={<VolunteersPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="question-papers" element={<QuestionPapersPage />} />
        <Route path="printing" element={<PrintingPage />} />
        <Route path="assessments" element={<AssessmentSchedulingPage />} />
        <Route path="pipeline" element={<AssessmentPipelinePage />} />
        <Route path="schools" element={<BlockSchoolsPage />} />
        <Route path="student-registrations" element={<StudentRegistrationsPage />} />
        <Route path="locked-schools" element={<LockedSchoolsPage />} />
        <Route path="analytics" element={<BlockAnalyticsPage />} />
        <Route path="reports" element={<BlockReportsPage />} />
        <Route path="notifications" element={<BlockNotificationsPage />} />
        <Route path="*" element={<Navigate to="/block" replace />} />
      </Route>
    </Routes>
  );
}