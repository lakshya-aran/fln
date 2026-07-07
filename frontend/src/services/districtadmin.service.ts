import api from "./api";
import type {
  IDistrictDashboard, IBlockRow, IDeletedSchool, IPipelineData,
  IBottleneckData, IBlockAdmin, IDistrictChartData, IAnalyticsData,
  INotificationData, IReportData,
} from "@/types/districtadmin";

const BASE = "/district";

export const districtAdminApi = {
  dashboard: () => api.get<{ success: boolean; data: IDistrictDashboard }>(`${BASE}/dashboard`).then(r => r.data.data),
  charts: () => api.get<{ success: boolean; data: IDistrictChartData }>(`${BASE}/dashboard/charts`).then(r => r.data.data),

  pipeline: (params?: { block?: string }) =>
    api.get<{ success: boolean; data: IPipelineData }>(`${BASE}/pipeline`, { params }).then(r => r.data.data),

  bottlenecks: (params?: { block?: string; severity?: string }) =>
    api.get<{ success: boolean; data: IBottleneckData }>(`${BASE}/bottlenecks`, { params }).then(r => r.data.data),

  blocks: (params?: { search?: string; sortBy?: string; order?: string }) =>
    api.get<{ success: boolean; data: IBlockRow[] }>(`${BASE}/blocks`, { params }).then(r => r.data.data),

  schools: (params?: { search?: string; block?: string; stage?: string; status?: string }) =>
    api.get<{ success: boolean; data: IDeletedSchool[] }>(`${BASE}/schools`, { params }).then(r => r.data.data),

  blockAdmins: (params?: { search?: string; block?: string }) =>
    api.get<{ success: boolean; data: IBlockAdmin[] }>(`${BASE}/block-admins`, { params }).then(r => r.data.data),
  createBlockAdmin: (data: { name: string; email: string; employeeId: string; password: string; block?: string; assignedBlocks?: string[] }) =>
    api.post(`${BASE}/block-admins`, data).then(r => r.data),
  updateBlockAdmin: (id: string, data: Partial<IBlockAdmin>) =>
    api.put(`${BASE}/block-admins/${id}`, data).then(r => r.data),
  deactivateBlockAdmin: (id: string) =>
    api.patch(`${BASE}/block-admins/${id}/deactivate`).then(r => r.data),
  resetBlockAdminPassword: (id: string, password: string) =>
    api.post(`${BASE}/block-admins/${id}/reset-password`, { password }).then(r => r.data),

  analytics: () => api.get<{ success: boolean; data: IAnalyticsData }>(`${BASE}/analytics`).then(r => r.data.data),

  reports: (type: string) =>
    api.get<{ success: boolean; data: IReportData }>(`${BASE}/reports`, { params: { type } }).then(r => r.data.data),
  reportHistory: () =>
    api.get(`${BASE}/reports/history`).then(r => r.data.data),

  notifications: (params?: { type?: string; severity?: string; read?: string }) =>
    api.get<{ success: boolean; data: INotificationData }>(`${BASE}/notifications`, { params }).then(r => r.data.data),
  markNotificationRead: (id: string) =>
    api.patch(`${BASE}/notifications/${id}/read`).then(r => r.data),
  markAllNotificationsRead: () =>
    api.patch(`${BASE}/notifications/read-all`).then(r => r.data),
};
