export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
  redirectPath?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const ROLE_REDIRECTIONS: Record<string, string> = {
  teacher: "/dashboard/teacher",
  principal: "/dashboard/principal",
  volunteer: "/dashboard/volunteer",
  block_officer: "/block",
  district_officer: "/district",
  state_admin: "/admin",
  national_admin: "/superadmin",
};
