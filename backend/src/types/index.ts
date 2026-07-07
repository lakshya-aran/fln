import { Request } from "express";

export interface JwtPayload {
  userId: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export enum UserRole {
  TEACHER = "teacher",
  PRINCIPAL = "principal",
  VOLUNTEER = "volunteer",
  BLOCK_OFFICER = "block_officer",
  DISTRICT_OFFICER = "district_officer",
  STATE_ADMIN = "state_admin",
  NATIONAL_ADMIN = "national_admin",
}

export const ROLE_REDIRECTIONS: Record<string, string> = {
  [UserRole.TEACHER]: "/dashboard/teacher",
  [UserRole.PRINCIPAL]: "/dashboard/principal",
  [UserRole.VOLUNTEER]: "/dashboard/volunteer",
  [UserRole.BLOCK_OFFICER]: "/dashboard/block",
  [UserRole.DISTRICT_OFFICER]: "/dashboard/district",
  [UserRole.STATE_ADMIN]: "/dashboard/state",
  [UserRole.NATIONAL_ADMIN]: "/dashboard/national",
};
