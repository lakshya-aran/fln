import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { SchoolPerformance } from "../models/SchoolPerformance";
import { InfrastructureRequest } from "../models/InfrastructureRequest";
import { stAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getStateFromRequest } from "../middleware/stateAdminAuth";

export const getDashboard = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    if (!state) {
      sendSuccess(res, { state: "", message: "No state assigned" });
      return;
    }

    const stateFilter = { state };

    const [
      districts,
      blocksCount,
      schoolsCount,
      teachers,
      students,
      volunteers,
      lockedSchools,
      infrastructureOpen,
      schoolPerformanceAgg,
      districtsLowCert,
    ] = await Promise.all([
      User.distinct("district", { ...stateFilter, role: "district_officer" }),
      User.countDocuments({ ...stateFilter, role: "block_officer" }),
      User.countDocuments({ ...stateFilter, role: "principal" }),
      User.countDocuments({ ...stateFilter, role: "teacher" }),
      User.countDocuments({ ...stateFilter, role: "student" }),
      User.countDocuments({ ...stateFilter, role: "volunteer" }),
      User.countDocuments({ ...stateFilter, role: "principal", isActive: false }),
      InfrastructureRequest.countDocuments({ ...stateFilter, status: { $in: ["pending", "approved", "in_progress"] } }),
      SchoolPerformance.aggregate([
        { $match: stateFilter },
        {
          $group: {
            _id: null,
            avgAssessmentCompletion: { $avg: "$assessmentCompletion" },
            avgFLNCertification: { $avg: "$flnCertification" },
            avgReadingScore: { $avg: "$readingScore" },
            avgMathScore: { $avg: "$mathScore" },
          },
        },
      ]),
      SchoolPerformance.distinct("district", {
        ...stateFilter,
        flnCertification: { $lt: 40 },
      }),
    ]);

    const metrics = schoolPerformanceAgg[0] || {
      avgAssessmentCompletion: 0,
      avgFLNCertification: 0,
      avgReadingScore: 0,
      avgMathScore: 0,
    };

    sendSuccess(res, {
      data: {
        state,
        totalDistricts: districts.filter(Boolean).length,
        totalBlocks: blocksCount,
        totalSchools: schoolsCount,
        teachers,
        students,
        volunteers,
        lockedSchools,
        pendingInfrastructureRequests: infrastructureOpen,
        districtsBelow40: districtsLowCert.length,
        assessmentCompletion: Math.round(metrics.avgAssessmentCompletion || 0),
        flnCertification: Math.round(metrics.avgFLNCertification || 0),
        readingScore: Math.round(metrics.avgReadingScore || 0),
        mathScore: Math.round(metrics.avgMathScore || 0),
      },
    });
  }
);

export const getChartData = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const districtCert = await SchoolPerformance.aggregate([
      { $match: { state } },
      {
        $group: {
          _id: "$district",
          certification: { $avg: "$flnCertification" },
          completion: { $avg: "$assessmentCompletion" },
          schools: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyTrend = await SchoolPerformance.aggregate([
      { $match: { state } },
      {
        $group: {
          _id: { $month: "$lastUpdated" },
          reading: { $avg: "$readingScore" },
          math: { $avg: "$mathScore" },
          completion: { $avg: "$assessmentCompletion" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const volunteerDist = await User.aggregate([
      { $match: { state, role: "volunteer" } },
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const schoolStatus = await SchoolPerformance.aggregate([
      { $match: { state } },
      { $group: { _id: "$completionStatus", count: { $sum: 1 } } },
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of schoolStatus) statusMap[s._id] = s.count;

    sendSuccess(res, {
      data: {
        districtCert: districtCert.map(d => ({
          district: d._id,
          certification: Math.round(d.certification || 0),
          completion: Math.round(d.completion || 0),
          schools: d.schools,
        })),
        monthlyTrend: monthlyTrend.map(m => ({
          month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m._id - 1],
          reading: Math.round(m.reading || 0),
          math: Math.round(m.math || 0),
          completion: Math.round(m.completion || 0),
        })),
        volunteerDist: volunteerDist.map(v => ({
          district: v._id,
          count: v.count,
        })),
        schoolStatus: statusMap,
      },
    });
  }
);