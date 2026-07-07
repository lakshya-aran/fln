export interface IDistrictDashboard {
  district: string;
  totalBlocks: number;
  totalSchools: number;
  teachers: number;
  volunteers: number;
  bottleneckedSchools: number;
  assessmentCompletion: number;
  flnCertification: number;
  readingScore: number;
  mathScore: number;
  certifiedSchools: number;
  schoolsInPipeline: number;
  unreadNotifications: number;
}

export interface IBlockRow {
  block: string;
  schools: number;
  teachers: number;
  volunteers: number;
  flnCertification: number;
  assessmentCompletion: number;
  readingScore: number;
  mathScore: number;
  inPipeline: number;
  certified: number;
}

export interface IDeletedSchool {
  _id: string;
  name: string;
  email: string;
  school: string;
  block: string;
  isActive: boolean;
  assessmentCompletion: number;
  flnCertification: number;
  readingScore: number;
  mathScore: number;
  completionStatus: string;
  pipelineStage: string | null;
  daysInCurrentStage: number;
}

export interface IPipelineStage {
  stage: string;
  label: string;
  count: number;
  schools: Array<{
    school: string;
    block: string;
    schoolId: string;
    pipelineEnteredAt: string;
  }>;
}

export interface IPipelineData {
  pipeline: IPipelineStage[];
  stagePercentage: Array<{ stage: string; label: string; count: number; percentage: number }>;
  totalInPipeline: number;
  totalSchools: number;
  notStarted: number;
}

export interface IBottleneck {
  schoolId: string;
  school: string;
  block: string;
  stage: string;
  daysInStage: number;
  severity: "delayed" | "critical";
  readingScore: number;
  mathScore: number;
  assessmentCompletion: number;
  flnCertification: number;
}

export interface IBottleneckData {
  bottlenecks: IBottleneck[];
  totalDelayed: number;
  totalCritical: number;
  total: number;
}

export interface IBlockAdmin {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  block: string;
  assignedBlocks: string[];
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface IDistrictChartData {
  blockCert: Array<{ block: string; certification: number; completion: number; schools: number }>;
  pipelineDistribution: Array<{ stage: string; count: number }>;
  monthlyTrend: Array<{ month: string; reading: number; math: number; completion: number }>;
  schoolStatus: Record<string, number>;
}

export interface IAnalyticsData {
  blockWise: Array<{
    block: string;
    avgReading: number;
    avgMath: number;
    avgCertification: number;
    avgCompletion: number;
    totalSchools: number;
    certified: number;
  }>;
  stageTrend: Array<{ _id: { stage: string; month: number }; count: number }>;
  lowPerformingSchools: Array<{
    school: string;
    block: string;
    schoolId: string;
    readingScore: number;
    mathScore: number;
    flnCertification: number;
    assessmentCompletion: number;
    pipelineStage: string | null;
  }>;
  volunteerDistribution: Array<{ block: string; count: number }>;
  topPerformers: Array<{
    school: string;
    block: string;
    flnCertification: number;
    readingScore: number;
    mathScore: number;
  }>;
}

export interface INotification {
  _id: string;
  district: string;
  block?: string;
  type: "bottleneck" | "milestone" | "report_ready" | "system";
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  read: boolean;
  createdAt: string;
}

export interface INotificationData {
  notifications: INotification[];
  unreadCount: number;
}

export interface IReportData {
  reportType: string;
  district: string;
  generatedAt: string;
  [key: string]: unknown;
}
