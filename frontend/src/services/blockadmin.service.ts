import api from "./api";
import type {
  IBlockDashboard, IVolunteer, IVolunteerAssignment, IQuestionPaper,
  IPrintRequest, IAssessmentSchedule, IStudentRegistration, ILockedSchool,
  ISchoolRecovery, IBlockAnalytics, IBlockNotification, IAssessmentPipeline,
  IReportData,
} from "@/types/blockadmin";

const BASE = "/block";

export const blockAdminApi = {
  dashboard: () => api.get<{ success: boolean; data: IBlockDashboard }>(`${BASE}/dashboard`).then(r => r.data.data),
  charts: () => api.get(`${BASE}/dashboard/charts`).then(r => r.data.data),

  analytics: () => api.get<{ success: boolean; data: IBlockAnalytics }>(`${BASE}/analytics`).then(r => r.data.data),
  schools: (params?: { search?: string; status?: string }) =>
    api.get(`${BASE}/schools`, { params }).then(r => r.data.data),
  schoolById: (id: string) => api.get(`${BASE}/schools/${id}`).then(r => r.data.data),

  volunteers: (params?: { search?: string; status?: string; isActive?: string }) =>
    api.get(`${BASE}/volunteers`, { params }).then(r => r.data.data),
  volunteerById: (id: string) => api.get(`${BASE}/volunteers/${id}`).then(r => r.data.data),
  updateVolunteer: (id: string, data: { isActive?: boolean; status?: string; reliabilityScore?: number }) =>
    api.put(`${BASE}/volunteers/${id}`, data).then(r => r.data),
  assignVolunteer: (data: {
    volunteerId: string; volunteerName: string; volunteerEmail: string;
    school: string; schoolId: string; availability?: string; notes?: string;
  }) => api.post(`${BASE}/volunteers/assign`, data).then(r => r.data),
  emergencyReplacement: (data: {
    assignmentId: string; replacementVolunteerId: string;
    replacementVolunteerName: string; replacementVolunteerEmail: string; reason?: string;
  }) => api.post(`${BASE}/volunteers/emergency-replacement`, data).then(r => r.data),

  assignments: (params?: { status?: string; school?: string; volunteerId?: string }) =>
    api.get(`${BASE}/assignments`, { params }).then(r => r.data.data),
  nearbySchools: () => api.get(`${BASE}/assignments/nearby-schools`).then(r => r.data.data),
  updateAssignment: (id: string, data: { assignmentStage?: string; status?: string; reliabilityScore?: number; notes?: string }) =>
    api.put(`${BASE}/assignments/${id}`, data).then(r => r.data),

  questionPapers: (params?: { schoolId?: string; subject?: string; grade?: number }) =>
    api.get(`${BASE}/question-papers`, { params }).then(r => r.data.data),
  generatePaper: (data: {
    schoolId: string; school: string;
    subject: "english" | "hindi" | "math" | "regional";
    grade: number; language?: string; version?: number;
    reason: "low_strength" | "no_internet" | "locked_school" | "manual";
    questionsCount?: number; volunteerId?: string;
  }) => api.post(`${BASE}/question-papers/generate`, data).then(r => r.data),
  printPaper: (data: { paperCode: string; copies?: number; reason: string; volunteerId?: string; notes?: string }) =>
    api.post(`${BASE}/question-papers/print`, data).then(r => r.data),
  printRequests: (params?: { status?: string }) =>
    api.get(`${BASE}/print-requests`, { params }).then(r => r.data.data),
  updatePrintStatus: (id: string, status: string) =>
    api.patch(`${BASE}/print-requests/${id}/status`, { status }).then(r => r.data),

  schedules: (params?: { status?: string; schoolId?: string; from?: string; to?: string }) =>
    api.get(`${BASE}/assessment/schedules`, { params }).then(r => r.data.data),
  scheduleAssessment: (data: {
    schoolId: string; school: string;
    subject: "english" | "hindi" | "math" | "regional";
    grade: number; scheduledDate: string; session?: "morning" | "afternoon" | "full_day";
    volunteerId?: string; notes?: string;
  }) => api.post(`${BASE}/assessment/schedule`, data).then(r => r.data),
  updateScheduleStatus: (id: string, status: string) =>
    api.patch(`${BASE}/assessment/schedules/${id}/status`, { status }).then(r => r.data),
  assessmentPipeline: () =>
    api.get<{ success: boolean; data: IAssessmentPipeline }>(`${BASE}/assessment/pipeline`).then(r => r.data.data),

  registrations: (params?: { status?: string; registrationType?: string; schoolId?: string }) =>
    api.get(`${BASE}/student-registration`, { params }).then(r => r.data.data),
  registrationById: (id: string) =>
    api.get(`${BASE}/student-registration/${id}`).then(r => r.data.data),
  createRegistration: (data: {
    schoolId: string; school: string;
    registrationType: "dropout" | "new_admission" | "missing_records";
    volunteerId: string; volunteerName: string;
    studentName: string; guardianName: string; guardianPhone?: string;
    grade: number; classSection?: string; address?: string; documents?: string[];
  }) => api.post(`${BASE}/student-registration`, data).then(r => r.data),
  updateRegistration: (id: string, data: {
    status: "approved" | "rejected"; verificationStatus?: "verified" | "rejected"; rejectionReason?: string;
  }) => api.put(`${BASE}/student-registration/${id}`, data).then(r => r.data),

  lockedSchools: (search?: string) =>
    api.get(`${BASE}/locked-schools`, { params: { search } }).then(r => r.data.data),
  viewLockReason: (email: string) => api.post(`${BASE}/locked-schools/view`, { email }).then(r => r.data),
  temporaryAccess: (email: string, reason: string) =>
    api.post(`${BASE}/locked-schools/temporary-access`, { email, reason }).then(r => r.data),
  resetLogin: (email: string, reason: string) =>
    api.post(`${BASE}/locked-schools/reset-login`, { email, reason }).then(r => r.data),
  unlockSchool: (email: string, reason: string, action?: string) =>
    api.post(`${BASE}/unlock-school`, { email, reason, action }).then(r => r.data),
  recoveryHistory: () => api.get(`${BASE}/recovery-history`).then(r => r.data.data),

  notifications: (params?: { type?: string; severity?: string; read?: string }) =>
    api.get(`${BASE}/notifications`, { params }).then(r => r.data.data),
  createNotification: (data: {
    type: "reminder" | "assessment" | "printing_ready" | "assignment" | "emergency" | "milestone" | "system";
    targetRole: "schools" | "teachers" | "volunteers" | "principals" | "all";
    targetSchoolId?: string; title: string; message: string; severity?: "info" | "warning" | "critical";
  }) => api.post(`${BASE}/notifications`, data).then(r => r.data),
  markNotificationRead: (id: string) =>
    api.patch(`${BASE}/notifications/${id}/read`).then(r => r.data),
  markAllNotificationsRead: () =>
    api.patch(`${BASE}/notifications/read-all`).then(r => r.data),

  generateReport: (type: string, format?: "json" | "csv") =>
    api.get<{ success: boolean; data: IReportData }>(`${BASE}/reports`, {
      params: { type, format },
      responseType: format === "csv" ? "blob" : "json",
    }).then(r => (format === "csv" ? r.data : r.data.data)),
};