import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { User } from "../../models/User";
import { daAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getDistrictFromRequest } from "../middleware/districtAdminAuth";

export const getAnalytics = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);

    const blockWise = await SchoolPerformance.aggregate([
      { $match: { district } },
      {
        $group: {
          _id: "$block",
          avgReading: { $avg: "$readingScore" },
          avgMath: { $avg: "$mathScore" },
          avgCertification: { $avg: "$flnCertification" },
          avgCompletion: { $avg: "$assessmentCompletion" },
          totalSchools: { $sum: 1 },
          certified: { $sum: { $cond: [{ $eq: ["$pipelineStage", "certified"] }, 1, 0] } },
        },
      },
      { $sort: { avgCertification: -1 } },
    ]);

    const stageTrend = await SchoolPerformance.aggregate([
      { $match: { district, pipelineStage: { $ne: null } } },
      {
        $group: {
          _id: { stage: "$pipelineStage", month: { $month: "$pipelineEnteredAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const lowPerformingSchools = await SchoolPerformance.find({
      district,
      $or: [
        { flnCertification: { $lt: 40 } },
        { readingScore: { $lt: 35 } },
        { mathScore: { $lt: 35 } },
      ],
    }).sort({ flnCertification: 1 }).limit(20).lean();

    const volunteerDistribution = await User.aggregate([
      { $match: { district, role: "volunteer" } },
      { $group: { _id: "$block", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const topPerformers = await SchoolPerformance.find({ district })
      .sort({ flnCertification: -1 })
      .limit(10)
      .lean();

    sendSuccess(res, {
      data: {
        blockWise: blockWise.map(b => ({
          block: b._id,
          avgReading: Math.round(b.avgReading || 0),
          avgMath: Math.round(b.avgMath || 0),
          avgCertification: Math.round(b.avgCertification || 0),
          avgCompletion: Math.round(b.avgCompletion || 0),
          totalSchools: b.totalSchools,
          certified: b.certified,
        })),
        stageTrend,
        lowPerformingSchools: lowPerformingSchools.map(s => ({
          school: s.school,
          block: s.block,
          schoolId: s.schoolId,
          readingScore: s.readingScore,
          mathScore: s.mathScore,
          flnCertification: s.flnCertification,
          assessmentCompletion: s.assessmentCompletion,
          pipelineStage: s.pipelineStage,
        })),
        volunteerDistribution: volunteerDistribution.map(v => ({
          block: v._id,
          count: v.count,
        })),
        topPerformers: topPerformers.map(s => ({
          school: s.school,
          block: s.block,
          flnCertification: s.flnCertification,
          readingScore: s.readingScore,
          mathScore: s.mathScore,
        })),
      },
    });
  }
);
