export enum UserRole {
  TEACHER = "teacher",
  PRINCIPAL = "principal",
  VOLUNTEER = "volunteer",
  BLOCK_OFFICER = "block_officer",
  DISTRICT_OFFICER = "district_officer",
  STATE_ADMIN = "state_admin",
  NATIONAL_ADMIN = "national_admin",
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: Pick<IUser, "id" | "name" | "email" | "role" | "employeeId">;
  redirectPath?: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.TEACHER]: "Teacher",
  [UserRole.PRINCIPAL]: "Principal",
  [UserRole.VOLUNTEER]: "Volunteer",
  [UserRole.BLOCK_OFFICER]: "Block Officer",
  [UserRole.DISTRICT_OFFICER]: "District Officer",
  [UserRole.STATE_ADMIN]: "State Admin",
  [UserRole.NATIONAL_ADMIN]: "National Admin",
};

export const ROLE_REDIRECTIONS: Record<UserRole, string> = {
  [UserRole.TEACHER]: "/dashboard/teacher",
  [UserRole.PRINCIPAL]: "/dashboard/principal",
  [UserRole.VOLUNTEER]: "/dashboard/volunteer",
  [UserRole.BLOCK_OFFICER]: "/dashboard/block",
  [UserRole.DISTRICT_OFFICER]: "/dashboard/district",
  [UserRole.STATE_ADMIN]: "/dashboard/state",
  [UserRole.NATIONAL_ADMIN]: "/dashboard/national",
};
