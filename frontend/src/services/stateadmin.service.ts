import api from "./api";
import type {
  IStateDashboard, IDistrictRow, IDistrictDetail, ISchool, ILockedSchool,
  ILowPerformingDistrict, IDistrictAdmin, IInfrastructureRequest, IChartData,
} from "@/types/stateadmin";

const BASE = "/admin";

export const stateAdminApi = {
  dashboard: () => api.get<{ success: boolean; data: IStateDashboard }>(`${BASE}/dashboard`).then(r => r.data.data),
  charts: () => api.get<{ success: boolean; data: IChartData }>(`${BASE}/dashboard/charts`).then(r => r.data.data),

  districts: (params?: { search?: string; sortBy?: string; order?: "asc" | "desc"; page?: number; limit?: number }) =>
    api.get(`${BASE}/districts`, { params }).then(r => r.data.data),
  districtById: (id: string) => api.get(`${BASE}/districts/${encodeURIComponent(id)}`).then(r => r.data.data),
  lowPerformingDistricts: () => api.get(`${BASE}/districts/low-performing`).then(r => r.data.data),
  certificationByDistrict: () => api.get(`${BASE}/districts/certification`).then(r => r.data.data),

  schools: (params?: { search?: string; district?: string; block?: string; status?: string; page?: number; limit?: number }) =>
    api.get(`${BASE}/schools`, { params }).then(r => r.data.data),
  schoolById: (id: string) => api.get(`${BASE}/schools/${id}`).then(r => r.data.data),
  lockedSchools: (search?: string) => api.get(`${BASE}/schools/locked`, { params: { search } }).then(r => r.data.data),

  districtAdmins: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get(`${BASE}/district-admin`, { params }).then(r => r.data.data),
  createDistrictAdmin: (data: { name: string; email: string; password: string; assignedDistrict: string; employeeId: string }) =>
    api.post(`${BASE}/district-admin`, data).then(r => r.data),
  updateDistrictAdmin: (id: string, data: any) =>
    api.put(`${BASE}/district-admin/${id}`, data).then(r => r.data),
  deactivateDistrictAdmin: (id: string) =>
    api.patch(`${BASE}/district-admin/${id}/deactivate`).then(r => r.data),
  resetDistrictAdminPassword: (id: string, password: string) =>
    api.post(`${BASE}/district-admin/${id}/reset-password`, { password }).then(r => r.data),
  districtAdminLoginHistory: (id: string) =>
    api.get(`${BASE}/district-admin/${id}/login-history`).then(r => r.data.data),

  unlockSchool: (email: string, reason: string) =>
    api.post(`${BASE}/unlock-school`, { email, reason }).then(r => r.data),

  infrastructureRequests: (params?: { status?: string; category?: string }) =>
    api.get(`${BASE}/infrastructure-requests`, { params }).then(r => r.data.data),

  generateReport: (type: string) =>
    api.get(`${BASE}/reports`, { params: { type } }).then(r => r.data.data),
};