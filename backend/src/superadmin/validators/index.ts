import { z } from "zod";

export const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().min(1, "Role is required"),
  permissions: z.array(z.string()).optional(),
  assignedStates: z.array(z.string()).optional(),
  assignedDistricts: z.array(z.string()).optional(),
});

export const updateAdminSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  assignedStates: z.array(z.string()).optional(),
  assignedDistricts: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const calendarSchema = z.object({
  cycle: z.enum(["baseline", "mid-year", "end-of-year"]),
  academicYear: z.string().min(4),
  label: z.string().min(2),
  description: z.string().optional(),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  resultDate: z.string().transform((s) => new Date(s)),
  status: z.enum(["draft", "published", "locked", "archived"]).optional(),
});

export const curriculumSchema = z.object({
  title: z.string().min(2),
  subject: z.string().min(1),
  grade: z.string().min(1),
  language: z.string().min(1),
  content: z.string().min(10),
  status: z.enum(["draft", "published", "archived"]).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  competencies: z.array(z.string()).optional(),
  versionNotes: z.string().optional(),
});

export const feedbackUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "rejected", "merged"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedTo: z.string().optional(),
  resolution: z.string().optional(),
  duplicateOf: z.string().optional(),
});

export const questionReviewSchema = z.object({
  status: z.enum(["pending", "approved", "edited", "replaced", "archived"]),
  notes: z.string().optional(),
  recommendation: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(10),
  type: z.enum(["info", "urgent", "update"]).optional(),
  status: z.enum(["draft", "scheduled", "published", "archived"]).optional(),
  targetAudience: z.object({
    allIndia: z.boolean().optional(),
    states: z.array(z.string()).optional(),
    districts: z.array(z.string()).optional(),
    blocks: z.array(z.string()).optional(),
    schools: z.array(z.string()).optional(),
    roles: z.array(z.string()).optional(),
  }).optional(),
  scheduledAt: z.string().optional(),
  sendEmail: z.boolean().optional(),
});
