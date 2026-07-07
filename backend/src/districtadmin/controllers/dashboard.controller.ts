import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { Notification } from "../models/Notification";
import { daAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getDistrictFromRequest } from "../middleware/districtAdminAuth";

export const getDashboard = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    if (!district) {
      sendSuccess(res, { data: { district: "", message: "No district assigned" } });
      return;
    }

    const districtFilter = { district };

    const [
      blocks,
      schoolsCount,
      teachers,
      volunteers,
      bottleneckedSchools,
      performanceAgg,
    ] = await Promise.all([
      User.distinct("block", { ...districtFilter, role: "block_officer" }),
      SchoolPerformance.countDocuments(districtFilter),
      User.countDocuments({ ...districtFilter, role: "teacher" }),
      User.countDocuments({ ...districtFilter, role: "volunteer" }),
      SchoolPerformance.countDocuments({
        ...districtFilter,
        pipelineStage: { $ne: "certified", $ne: null },
        pipelineEnteredAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      SchoolPerformance.aggregate([
        { $match: districtFilter },
        {
          $group: {
            _id: null,
            avgAssessmentCompletion: { $avg: "$assessmentCompletion" },
            avgFLNCertification: { $avg: "$flnCertification" },
            avgReadingScore: { $avg: "$readingScore" },
            avgMathScore: { $avg: "$mathScore" },
            certified: { $sum: { $cond: [{ $eq: ["$pipelineStage", "certified"] }, 1, 0] } },
            inPipeline: { $sum: { $cond: [{ $ne: ["$pipelineStage", null] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const unreadNotifications = await Notification.countDocuments({ district, read: false });

    const metrics = performanceAgg[0] || {
      avgAssessmentCompletion: 0,
      avgFLNCertification: 0,
      avgReadingScore: 0,
      avgMathScore: 0,
      certified: 0,
      inPipeline: 0,
    };

    sendSuccess(res, {
      data: {
        district,
        totalBlocks: blocks.filter(Boolean).length,
        totalSchools: schoolsCount,
        teachers,
        volunteers,
        bottleneckedSchools,
        assessmentCompletion: Math.round(metrics.avgAssessmentCompletion || 0),
        flnCertification: Math.round(metrics.avgFLNCertification || 0),
        readingScore: Math.round(metrics.avgReadingScore || 0),
        mathScore: Math.round(metrics.avgMathScore || 0),
        certifiedSchools: metrics.certified,
        schoolsInPipeline: metrics.inPipeline,
        unreadNotifications,
      },
    });
  }
);

export const getChartData = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    const districtFilter = { district };
    const blockCert = await SchoolPerformance.aggregate([
      { $match: districtFilter },
      {
        $group: {
          _id: "$block",
          certification: { $avg: "$flnCertification" },
          completion: { $avg: "$assessmentCompletion" },
          schools: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const pipelineDistribution = await SchoolPerformance.aggregate([
      { $match: { ...districtFilter, pipelineStage: { $ne: null } } },
      { $group: { _id: "$pipelineStage", count: { $sum: 1 } } },
    ]);

    const monthlyTrend = await SchoolPerformance.aggregate([
      { $match: districtFilter },
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

    const schoolStatus = await SchoolPerformance.aggregate([
      { $match: districtFilter },
      { $group: { _id: "$completionStatus", count: { $sum: 1 } } },
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of schoolStatus) statusMap[s._id] = s.count;

    sendSuccess(res, {
      data: {
        blockCert: blockCert.map(b => ({
          block: b._id,
          certification: Math.round(b.certification || 0),
          completion: Math.round(b.completion || 0),
          schools: b.schools,
        })),
        pipelineDistribution: pipelineDistribution.map(p => ({
          stage: p._id,
          count: p.count,
        })),
        monthlyTrend: monthlyTrend.map(m => ({
          month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m._id - 1],
          reading: Math.round(m.reading || 0),
          math: Math.round(m.math || 0),
          completion: Math.round(m.completion || 0),
        })),
        schoolStatus: statusMap,
      },
    });
  }
);
