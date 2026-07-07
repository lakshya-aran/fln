import api from "./api";
import type {
  IAdmin, IAssessmentCalendar, ICurriculum, IQuestionReview,
  IFeedback, IAnnouncement, IVisualAsset, IAuditLog,
  IDashboardData, INationwideStats, IPaginatedResponse,
} from "@/types/superadmin";

const BASE = "/superadmin";

export const superadminApi = {
  dashboard: () => api.get<{ success: boolean; data: IDashboardData }>(`${BASE}/dashboard`).then(r => r.data.data),
  nationwideStats: () => api.get<{ success: boolean; data: INationwideStats }>(`${BASE}/dashboard/stats`).then(r => r.data.data),

  admins: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get(`${BASE}/admin`, { params }).then(r => r.data),
  createAdmin: (data: Partial<IAdmin> & { password: string }) =>
    api.post(`${BASE}/admin`, data).then(r => r.data),
  getAdmin: (id: string) => api.get(`${BASE}/admin/${id}`).then(r => r.data),
  updateAdmin: (id: string, data: Partial<IAdmin>) =>
    api.put(`${BASE}/admin/${id}`, data).then(r => r.data),
  deactivateAdmin: (id: string) =>
    api.patch(`${BASE}/admin/${id}/deactivate`).then(r => r.data),
  resetPassword: (id: string, password: string) =>
    api.post(`${BASE}/admin/${id}/reset-password`, { password }).then(r => r.data),

  calendars: () => api.get(`${BASE}/calendar`).then(r => r.data.calendars as IAssessmentCalendar[]),
  createCalendar: (data: Partial<IAssessmentCalendar>) =>
    api.post(`${BASE}/calendar`, data).then(r => r.data),
  updateCalendar: (id: string, data: Partial<IAssessmentCalendar>) =>
    api.put(`${BASE}/calendar/${id}`, data).then(r => r.data),

  curricula: (params?: { subject?: string; grade?: string; language?: string; status?: string }) =>
    api.get(`${BASE}/curriculum`, { params }).then(r => r.data.curricula as ICurriculum[]),
  getCurriculum: (id: string) => api.get(`${BASE}/curriculum/${id}`).then(r => r.data.curriculum),
  createCurriculum: (data: Partial<ICurriculum> & { versionNotes?: string }) =>
    api.post(`${BASE}/curriculum`, data).then(r => r.data),
  updateCurriculum: (id: string, data: Partial<ICurriculum> & { versionNotes?: string }) =>
    api.put(`${BASE}/curriculum/${id}`, data).then(r => r.data),
  restoreVersion: (id: string, version: number) =>
    api.post(`${BASE}/curriculum/${id}/restore/${version}`).then(r => r.data),

  questionReviews: (params?: { page?: number; limit?: number; status?: string; subject?: string; grade?: string; difficulty?: string }) =>
    api.get(`${BASE}/question-review`, { params }).then(r => r.data),
  updateQuestionReview: (id: string, data: { status: string; notes?: string; recommendation?: string }) =>
    api.put(`${BASE}/question-review/${id}`, data).then(r => r.data),

  visualAssets: (params?: { type?: string; subject?: string; grade?: string }) =>
    api.get(`${BASE}/visual-assets`, { params }).then(r => r.data.assets as IVisualAsset[]),
  createVisualAsset: (data: Partial<IVisualAsset>) =>
    api.post(`${BASE}/visual-assets`, data).then(r => r.data),
  replaceVisualAsset: (id: string, data: { url: string; title?: string; tags?: IVisualAsset["tags"] }) =>
    api.put(`${BASE}/visual-assets/${id}/replace`, data).then(r => r.data),

  feedbacks: (params?: { page?: number; limit?: number; status?: string; category?: string; priority?: string; source?: string; search?: string }) =>
    api.get(`${BASE}/feedback`, { params }).then(r => r.data),
  updateFeedback: (id: string, data: { status?: string; priority?: string; resolution?: string; assignedTo?: string; duplicateOf?: string }) =>
    api.put(`${BASE}/feedback/${id}`, data).then(r => r.data),

  announcements: (params?: { status?: string; type?: string }) =>
    api.get(`${BASE}/announcements`, { params }).then(r => r.data.announcements as IAnnouncement[]),
  createAnnouncement: (data: Partial<IAnnouncement>) =>
    api.post(`${BASE}/announcements`, data).then(r => r.data),
  updateAnnouncement: (id: string, data: Partial<IAnnouncement>) =>
    api.put(`${BASE}/announcements/${id}`, data).then(r => r.data),

  unlockSchool: (data: { email: string; reason: string }) =>
    api.post(`${BASE}/unlock-school`, data).then(r => r.data),
  searchSchool: (q: string) =>
    api.get(`${BASE}/search-school`, { params: { q } }).then(r => r.data.schools),

  analytics: () => api.get(`${BASE}/analytics`).then(r => r.data.data),
  assessmentStats: () => api.get(`${BASE}/analytics/assessments`).then(r => r.data.data),

  auditLogs: (params?: { page?: number; limit?: number; action?: string; resource?: string; userId?: string; startDate?: string; endDate?: string }) =>
    api.get(`${BASE}/audit`, { params }).then(r => r.data),
};
