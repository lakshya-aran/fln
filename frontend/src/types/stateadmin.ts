export interface IStateDashboard {
  state: string;
  totalDistricts: number;
  totalBlocks: number;
  totalSchools: number;
  teachers: number;
  students: number;
  volunteers: number;
  lockedSchools: number;
  pendingInfrastructureRequests: number;
  districtsBelow40: number;
  assessmentCompletion: number;
  flnCertification: number;
  readingScore: number;
  mathScore: number;
}

export interface IDistrictAdminRef {
  name: string;
  email: string;
  isActive: boolean;
  lastLogin: string | null;
}

export interface IDistrictRow {
  district: string;
  districtAdmin: IDistrictAdminRef | null;
  schools: number;
  teachers: number;
  students: number;
  volunteers: number;
  assessmentCompletion: number;
  flnCertification: number;
}

export interface IDistrictDetail {
  district: string;
  state: string;
  districtAdmin: IDistrictAdminRef | null;
  blocks: number;
  schools: number;
  teachers: number;
  students: number;
  volunteers: number;
  assessmentCompletion: number;
  flnCertification: number;
  readingScore: number;
  mathScore: number;
  infrastructureRequests: number;
  topPerformers: Array<{ name: string; certification: number }>;
  bottomPerformers: Array<{ name: string; certification: number }>;
  schools: Array<{
    name: string;
    schoolId: string;
    assessmentCompletion: number;
    flnCertification: number;
    completionStatus: string;
  }>;
}

export interface ISchool {
  _id: string;
  name: string;
  district: string;
  block: string;
  students: number;
  teachers: number;
  volunteers: number;
  assessmentCompletion: number;
  flnCertification: number;
  readingScore: number;
  mathScore: number;
  completionStatus: string;
  principal: IDistrictAdminRef | null;
}

export interface ILockedSchool {
  _id: string;
  name: string;
  email: string;
  school: string;
  district: string;
  block: string;
  employeeId: string;
  lastLogin: string | null;
  failedLoginAttempts: number;
  lockReason: string;
  lockedAt: string;
  isActive: boolean;
}

export interface ILowPerformingDistrict {
  district: string;
  certification: number;
  assessmentCompletion: number;
  schools: number;
  pendingSchools: number;
  totalStudents: number;
  totalTeachers: number;
  priority: "critical" | "high" | "medium";
  suggestedAction: string;
}

export interface IDistrictAdmin {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  district: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface IInfrastructureRequest {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  state: string;
  district: string;
  block: string;
  school: string;
  status: string;
  createdAt: string;
}

export interface IChartData {
  districtCert: Array<{ district: string; certification: number; completion: number; schools: number }>;
  monthlyTrend: Array<{ month: string; reading: number; math: number; completion: number }>;
  volunteerDist: Array<{ district: string; count: number }>;
  schoolStatus: Record<string, number>;
}