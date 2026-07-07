import { z } from "zod";

export const createDistrictAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  assignedDistrict: z.string().min(1),
  employeeId: z.string().min(1),
});

export const updateDistrictAdminSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  assignedDistrict: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const unlockSchoolSchema = z.object({
  email: z.string().email(),
  reason: z.string().min(5),
});

export const resetDistrictAdminPasswordSchema = z.object({
  password: z.string().min(8),
});