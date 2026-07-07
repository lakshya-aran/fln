import api from "./api";
import type { LoginRequest, LoginResponse } from "@/types";

export async function loginService(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export async function refreshTokenService(refreshToken: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/refresh", { refreshToken });
  return response.data;
}

export async function logoutService(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getMeService(): Promise<LoginResponse> {
  const response = await api.get<LoginResponse>("/auth/me");
  return response.data;
}
