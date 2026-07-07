import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { SchoolPerformance } from "../models/SchoolPerformance";
import { User } from "../../models/User";
import { InfrastructureRequest } from "../models/InfrastructureRequest";
import { stAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getStateFromRequest } from "../middleware/stateAdminAuth";

export const generateReport = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const { type } = req.query;
    let csv = "";
    let filename = "";

    switch (type) {
      case "state-summary": {
        csv = "Metric,Value\n";
        const overall = await SchoolPerformance.aggregate([
          { $match: { state } },
          {
            $group: {
              _id: null,
              schools: { $sum: 1 },
              students: { $sum: "$totalStudents" },
              teachers: { $sum: "$totalTeachers" },
              volunteers: { $sum: "$totalVolunteers" },
              avgCert: { $avg: "$flnCertification" },
              avgComp: { $avg: "$assessmentCompletion" },
              avgReading: { $avg: "$readingScore" },
              avgMath: { $avg: "$mathScore" },
            },
          },
        ]);
        const o = overall[0] || {};
        csv += `Schools,${o.schools}\n`;
        csv += `Students,${o.students}\n`;
        csv += `Teachers,${o.teachers}\n`;
        csv += `Volunteers,${o.volunteers}\n`;
        csv += `Average Certification,${Math.round(o.avgCert || 0)}\n`;
        csv += `Average Completion,${Math.round(o.avgComp || 0)}\n`;
        csv += `Average Reading Score,${Math.round(o.avgReading || 0)}\n`;
        csv += `Average Math Score,${Math.round(o.avgMath || 0)}\n`;
        filename = `${state}-state-summary-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }
      case "district-report": {
        const districts = await SchoolPerformance.aggregate([
          { $match: { state } },
          {
            $group: {
              _id: "$district",
              schools: { $sum: 1 },
              students: { $sum: "$totalStudents" },
              teachers: { $sum: "$totalTeachers" },
              volunteers: { $sum: "$totalVolunteers" },
              avgCert: { $avg: "$flnCertification" },
              avgComp: { $avg: "$assessmentCompletion" },
            },
          },
          { $sort: { _id: 1 } },
        ]);
        csv = "District,Schools,Students,Teachers,Volunteers,Avg Certification %,Avg Completion %\n";
        for (const d of districts) {
          csv += `${d._id},${d.schools},${d.students},${d.teachers},${d.volunteers},${Math.round(d.avgCert || 0)},${Math.round(d.avgComp || 0)}\n`;
        }
        filename = `${state}-district-report-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }
      case "school-report": {
        const schools = await SchoolPerformance.find({ state })
          .select("district block school totalStudents totalTeachers totalVolunteers assessmentCompletion flnCertification readingScore mathScore completionStatus");
        csv = "District,Block,School,Students,Teachers,Volunteers,Assessment %,FLN Cert %,Reading %,Math %,Status\n";
        for (const s of schools) {
          csv += `${s.district},${s.block},${s.school},${s.totalStudents},${s.totalTeachers},${s.totalVolunteers},${Math.round(s.assessmentCompletion || 0)},${Math.round(s.flnCertification || 0)},${Math.round(s.readingScore || 0)},${Math.round(s.mathScore || 0)},${s.completionStatus}\n`;
        }
        filename = `${state}-school-report-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }
      case "volunteer-report": {
        const volunteers = await User.find({ state, role: "volunteer" }).select("name email district block school isActive lastLogin");
        csv = "Name,Email,District,Block,School,Status,Last Login\n";
        for (const v of volunteers) {
          csv += `${v.name},${v.email},${v.district},${v.block},${v.school},${v.isActive ? "Active" : "Inactive"},${v.lastLogin ? new Date(v.lastLogin).toISOString() : ""}\n`;
        }
        filename = `${state}-volunteer-report-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }
      case "assessment-report": {
        const data = await SchoolPerformance.aggregate([
          { $match: { state } },
          {
            $group: {
              _id: "$completionStatus",
              count: { $sum: 1 },
              avgComp: { $avg: "$assessmentCompletion" },
            },
          },
        ]);
        csv = "Status,School Count,Average Completion %\n";
        for (const s of data) {
          csv += `${s._id},${s.count},${Math.round(s.avgComp || 0)}\n`;
        }
        filename = `${state}-assessment-report-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }
      case "certification-report": {
        const data = await SchoolPerformance.aggregate([
          { $match: { state } },
          {
            $bucket: {
              groupBy: "$flnCertification",
              boundaries: [0, 20, 40, 60, 80, 100],
              default: "other",
              output: {
                count: { $sum: 1 },
                schools: { $push: "$school" },
              },
            },
          },
        ]);
        csv = "Certification Range,School Count\n";
        const labels: Record<number, string> = {
          0: "0-20%",
          20: "20-40%",
          40: "40-60%",
          60: "60-80%",
          80: "80-100%",
        };
        for (const b of data) {
          csv += `${labels[(b as any)._id] || b._id},${b.count}\n`;
        }
        filename = `${state}-certification-report-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      }
      default:
        csv = "Type,Error\nMessage,Unknown report type";
        filename = "error.csv";
    }

    sendSuccess(res, { data: { csv, filename, state } });
  }
);