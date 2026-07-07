export interface IAdmin {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  assignedStates: string[];
  assignedDistricts: string[];
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAssessmentCalendar {
  _id: string;
  cycle: "baseline" | "mid-year" | "end-of-year";
  academicYear: string;
  label: string;
  description: string;
  startDate: string;
  endDate: string;
  resultDate: string;
  status: "draft" | "published" | "locked" | "archived";
  isActive: boolean;
}

export interface ICurriculumVersion {
  version: number;
  content: string;
  author: string;
  notes: string;
  createdAt: string;
}

export interface ICurriculum {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  language: string;
  currentVersion: number;
  content: string;
  status: "draft" | "published" | "archived";
  learningOutcomes: string[];
  competencies: string[];
  versions: ICurriculumVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface IQuestionReview {
  _id: string;
  questionId: string;
  questionText: string;
  subject: string;
  grade: string;
  difficulty: "easy" | "medium" | "hard";
  failureRate: number;
  totalAttempts: number;
  correctAttempts: number;
  flagReason: string;
  recommendation: string;
  status: "pending" | "approved" | "edited" | "replaced" | "archived";
  notes: string;
  createdAt: string;
}

export interface IFeedback {
  _id: string;
  title: string;
  description: string;
  category: "curriculum" | "assessment" | "technical" | "translation" | "infrastructure" | "bug" | "suggestion";
  priority: "low" | "medium" | "high" | "urgent";
  source: string;
  sourceUser: {
    name: string;
    email: string;
    role: string;
  };
  status: "open" | "in_progress" | "resolved" | "rejected" | "merged";
  resolution: string;
  createdAt: string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  type: "info" | "urgent" | "update";
  status: "draft" | "scheduled" | "published" | "archived";
  targetAudience: {
    allIndia: boolean;
    states: string[];
    districts: string[];
    blocks: string[];
    schools: string[];
    roles: string[];
  };
  scheduledAt: string | null;
  publishedAt: string | null;
  sendEmail: boolean;
  createdAt: string;
}

export interface IVisualAsset {
  _id: string;
  title: string;
  description: string;
  url: string;
  type: "image" | "illustration" | "icon";
  tags: {
    subjects: string[];
    grades: string[];
    languages: string[];
  };
  currentVersion: number;
  versions: Array<{ version: number; url: string; uploadedAt: string }>;
  fileSize: number;
  mimeType: string;
  isActive: boolean;
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  user: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  description: string;
  ip: string;
  userAgent: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  createdAt: string;
}

export interface IDashboardData {
  totalUsers: number;
  activeUsers: number;
  totalAdmins: number;
  calendarEntries: number;
  curricula: number;
  pendingReviews: number;
  openFeedback: number;
}

export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface INationwideStats {
  states: number;
  districts: number;
  blocks: number;
  schools: number;
  teachers?: number;
  students?: number;
  volunteers?: number;
}
