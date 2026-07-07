export interface IBlockDashboard {
  blocks: string[];
  district: string;
  state: string;
  totalSchools: number;
  teachers: number;
  students: number;
  volunteers: number;
  assessmentsScheduled: number;
  assessmentsCompleted: number;
  schoolsPending: number;
  questionPapersGenerated: number;
  schoolsWithoutInternet: number;
  printRequestsPending: number;
  studentRegistrationsPending: number;
  lockedSchoolDashboards: number;
  assessmentCompletion: number;
  flnCertification: number;
  readingScore: number;
  mathScore: number;
  schoolsInPipeline: number;
  certifiedSchools: number;
  unreadNotifications: number;
  studentGrowth: Array<{ month: number; count: number }>;
}

export interface IVolunteer {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  block: string;
  school: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  status: string;
  reliabilityScore: number;
  assignmentCount: number;
  completedCount: number;
  currentAssignment: {
    school: string;
    stage: string;
    assignedAt: string;
  } | null;
}

export interface IVolunteerAssignment {
  _id: string;
  block: string;
  district: string;
  state: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  school: string;
  schoolId: string;
  assignmentStage: string;
  status: string;
  reliabilityScore: number;
  availability: string;
  assignedAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  emergencyReplacement: boolean;
  notes: string;
}

export interface IQuestionPaper {
  _id: string;
  block: string;
  school: string;
  schoolId: string;
  subject: string;
  grade: number;
  language: string;
  version: number;
  reason: string;
  questionsCount: number;
  paperCode: string;
  generatedBy: string;
  volunteerId: string | null;
  locked: boolean;
  lockedAt: string | null;
  printedAt: string | null;
  printedBy: string | null;
  deliveredAt: string | null;
  downloadUrl: string;
}

export interface IPrintRequest {
  _id: string;
  block: string;
  school: string;
  schoolId: string;
  paperCode: string;
  copies: number;
  reason: string;
  status: string;
  requestedBy: string;
  volunteerId: string | null;
  notes: string;
  createdAt: string;
}

export interface IAssessmentSchedule {
  _id: string;
  block: string;
  school: string;
  schoolId: string;
  subject: string;
  grade: number;
  scheduledDate: string;
  session: string;
  volunteerId: string | null;
  volunteerName: string | null;
  status: string;
  locked: boolean;
  scheduledBy: string;
  notificationSent: boolean;
}

export interface IStudentRegistration {
  _id: string;
  block: string;
  school: string;
  schoolId: string;
  registrationType: "dropout" | "new_admission" | "missing_records";
  status: "pending" | "approved" | "rejected";
  verificationStatus: "pending" | "verified" | "rejected";
  volunteerId: string;
  volunteerName: string;
  studentName: string;
  guardianName: string;
  guardianPhone: string;
  grade: number;
  classSection: string;
  address: string;
  documents: string[];
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface ILockedSchool {
  _id: string;
  name: string;
  email: string;
  school: string;
  block: string;
  employeeId: string;
  lockReason: string;
  lockedAt: string | null;
  failedLoginAttempts: number;
  isActive: boolean;
}

export interface ISchoolRecovery {
  _id: string;
  block: string;
  school: string;
  schoolId: string;
  principalEmail: string;
  action: string;
  reason: string;
  performedBy: string;
  performedByRole: string;
  createdAt: string;
}

export interface IBlockAnalytics {
  block: string;
  cards: {
    schools: number;
    students: number;
    teachers: number;
    volunteers: number;
    certification: number;
    assessmentCompletion: number;
    schoolsPending: number;
  };
  schoolComparison: Array<{ school: string; flnCertification: number; readingScore: number; mathScore: number }>;
  volunteerActivity: Array<{ date: string; total: number; completed: number }>;
  assessmentTrend: Array<{ month: string; count: number }>;
  learningOutcomes: Array<{ block: string; reading: number; math: number; certification: number }>;
  studentGrowth: Array<{ month: string; count: number }>;
  volunteerReliability: Array<{ volunteerId: string; name: string; reliability: number; total: number; completed: number }>;
}

export interface IBlockNotification {
  _id: string;
  block: string;
  type: "reminder" | "assessment" | "printing_ready" | "assignment" | "emergency" | "milestone" | "system";
  targetRole: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  read: boolean;
  createdAt: string;
}

export interface IAssessmentPipeline {
  pipeline: Array<{
    stage: string;
    label: string;
    count: number;
    schedules: Array<{ id: string; school: string; subject: string; grade: number; scheduledDate: string; status: string; daysOverdue: number }>;
  }>;
  total: number;
}

export interface IReportData {
  block: string;
  generatedAt: string;
  reportType: string;
  [key: string]: unknown;
}