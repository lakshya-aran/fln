import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { User } from "../../models/User";
import { VolunteerAssignment } from "../models/VolunteerAssignment";
import { QuestionPaper } from "../models/QuestionPaper";
import { PrintRequest } from "../models/PrintRequest";
import { StudentRegistration } from "../models/StudentRegistration";
import { AssessmentSchedule } from "../models/AssessmentSchedule";
import { baAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getBlockFilter } from "../middleware/blockAdminAuth";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))].join("\n");
}

export const generateReport = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { type, format } = req.query;
    const u = req.user as any;

    let data: Record<string, unknown> = { block: u.block, generatedAt: new Date().toISOString() };
    let rows: Record<string, unknown>[] = [];

    switch (type) {
      case "volunteer": {
        rows = await User.find({ ...blockFilter, role: "volunteer" })
          .select("name email employeeId school isActive lastLogin")
          .lean();
        data.reportType = "Volunteer Report";
        data.volunteers = rows;
        break;
      }
      case "school": {
        rows = await SchoolPerformance.find(blockFilter).lean();
        data.reportType = "School Report";
        data.schools = rows;
        break;
      }
      case "assessment": {
        rows = await AssessmentSchedule.find(blockFilter).lean();
        data.reportType = "Assessment Report";
        data.assessments = rows;
        break;
      }
      case "question-paper": {
        rows = await QuestionPaper.find(blockFilter).lean();
        data.reportType = "Question Paper Report";
        data.papers = rows;
        break;
      }
      case "printing": {
        rows = await PrintRequest.find(blockFilter).lean();
        data.reportType = "Printing Report";
        data.printRequests = rows;
        break;
      }
      case "student-registration": {
        rows = await StudentRegistration.find(blockFilter).lean();
        data.reportType = "Student Registration Report";
        data.registrations = rows;
        break;
      }
      case "infrastructure": {
        rows = await SchoolPerformance.find(blockFilter).select("school block infrastructureRequests lastUpdated").lean();
        data.reportType = "Infrastructure Report";
        data.infrastructure = rows;
        break;
      }
      default:
        data.reportType = "Unknown";
        data.message = "Valid types: volunteer, school, assessment, question-paper, printing, student-registration, infrastructure";
    }

    if (format === "csv" && rows.length > 0) {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${type}-report-${u.block}.csv"`);
      res.send(toCSV(rows));
      return;
    }

    sendSuccess(res, { data });
  }
);