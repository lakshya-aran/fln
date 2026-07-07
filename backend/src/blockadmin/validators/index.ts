import { z } from "zod";

export const generateQuestionPaperSchema = z.object({
  schoolId: z.string().min(1),
  school: z.string().min(1),
  subject: z.enum(["english", "hindi", "math", "regional"]),
  grade: z.number().int().min(1).max(8),
  language: z.string().min(1).default("english"),
  version: z.number().int().min(1).max(20).default(1),
  reason: z.enum(["low_strength", "no_internet", "locked_school", "manual"]).default("manual"),
  questionsCount: z.number().int().min(5).max(100).default(20),
  volunteerId: z.string().optional(),
});

export const printPaperSchema = z.object({
  paperCode: z.string().min(1),
  copies: z.number().int().min(1).max(500).default(30),
  reason: z.string().min(3),
  volunteerId: z.string().optional(),
  notes: z.string().optional(),
});

export const scheduleAssessmentSchema = z.object({
  schoolId: z.string().min(1),
  school: z.string().min(1),
  subject: z.enum(["english", "hindi", "math", "regional"]),
  grade: z.number().int().min(1).max(8),
  scheduledDate: z.string().min(1),
  session: z.enum(["morning", "afternoon", "full_day"]).default("morning"),
  volunteerId: z.string().optional(),
  notes: z.string().optional(),
});

export const studentRegistrationSchema = z.object({
  schoolId: z.string().min(1),
  school: z.string().min(1),
  registrationType: z.enum(["dropout", "new_admission", "missing_records"]),
  volunteerId: z.string().min(1),
  volunteerName: z.string().min(1),
  studentName: z.string().min(1),
  guardianName: z.string().min(1),
  guardianPhone: z.string().optional(),
  grade: z.number().int().min(1).max(8),
  classSection: z.string().optional(),
  address: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

export const updateStudentRegistrationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  verificationStatus: z.enum(["verified", "rejected"]).optional(),
  rejectionReason: z.string().optional(),
});

export const assignVolunteerSchema = z.object({
  volunteerId: z.string().min(1),
  volunteerName: z.string().min(1),
  volunteerEmail: z.string().email(),
  school: z.string().min(1),
  schoolId: z.string().min(1),
  availability: z.string().optional(),
  notes: z.string().optional(),
});

export const updateVolunteerSchema = z.object({
  status: z.enum(["offline", "available", "assignment_offered", "assignment_accepted", "slot_locked", "on_duty", "completed"]).optional(),
  reliabilityScore: z.number().min(0).max(100).optional(),
  availability: z.string().optional(),
  notes: z.string().optional(),
});

export const unlockSchoolSchema = z.object({
  email: z.string().email(),
  reason: z.string().min(5),
  action: z.enum(["viewed_lock_reason", "temporary_access", "reset_login", "unlocked", "continued_assessment"]).default("unlocked"),
});

export const createNotificationSchema = z.object({
  type: z.enum(["reminder", "assessment", "printing_ready", "assignment", "emergency", "milestone", "system"]),
  targetRole: z.enum(["schools", "teachers", "volunteers", "principals", "all"]).default("all"),
  targetSchoolId: z.string().optional(),
  title: z.string().min(1),
  message: z.string().min(1),
  severity: z.enum(["info", "warning", "critical"]).default("info"),
});