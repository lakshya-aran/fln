import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { User } from "../../models/User";
import { Notification } from "../models/Notification";
import { daAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getDistrictFromRequest } from "../middleware/districtAdminAuth";

export const generateReport = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    const { type } = req.query;

    switch (type) {
      case "performance-summary": {
        const perf = await SchoolPerformance.aggregate([
          { $match: { district } },
          {
            $group: {
              _id: null,
              totalSchools: { $sum: 1 },
              avgReading: { $avg: "$readingScore" },
              avgMath: { $avg: "$mathScore" },
              avgCertification: { $avg: "$flnCertification" },
              avgCompletion: { $avg: "$assessmentCompletion" },
              certified: { $sum: { $cond: [{ $eq: ["$pipelineStage", "certified"] }, 1, 0] } },
              inPipeline: { $sum: { $cond: [{ $ne: ["$pipelineStage", null] }, 1, 0] } },
            },
          },
        ]);

        const agg = perf[0] || {};
        sendSuccess(res, {
          data: {
            reportType: "Performance Summary",
            district,
            generatedAt: new Date().toISOString(),
            ...agg,
            avgReading: Math.round(agg.avgReading || 0),
            avgMath: Math.round(agg.avgMath || 0),
            avgCertification: Math.round(agg.avgCertification || 0),
            avgCompletion: Math.round(agg.avgCompletion || 0),
          },
        });
        break;
      }
      case "bottleneck-report": {
        const bottlenecks = await SchoolPerformance.find({
          district,
          pipelineStage: { $ne: null, $ne: "certified" },
          pipelineEnteredAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }).sort({ pipelineEnteredAt: 1 }).lean();

        const reportData = bottlenecks.map(s => ({
          school: s.school,
          block: s.block,
          stage: s.pipelineStage,
          daysStuck: Math.floor((Date.now() - new Date(s.pipelineEnteredAt!).getTime()) / (1000 * 60 * 60 * 24)),
          readingScore: s.readingScore,
          mathScore: s.mathScore,
        }));

        sendSuccess(res, {
          data: {
            reportType: "Bottleneck Report",
            district,
            generatedAt: new Date().toISOString(),
            totalBottlenecks: reportData.length,
            bottlenecks: reportData,
          },
        });
        break;
      }
      case "block-comparison": {
        const blockData = await SchoolPerformance.aggregate([
          { $match: { district } },
          {
            $group: {
              _id: "$block",
              schools: { $sum: 1 },
              avgReading: { $avg: "$readingScore" },
              avgMath: { $avg: "$mathScore" },
              avgCertification: { $avg: "$flnCertification" },
              certified: { $sum: { $cond: [{ $eq: ["$pipelineStage", "certified"] }, 1, 0] } },
            },
          },
          { $sort: { avgCertification: -1 } },
        ]);

        sendSuccess(res, {
          data: {
            reportType: "Block Comparison",
            district,
            generatedAt: new Date().toISOString(),
            blocks: blockData.map(b => ({
              block: b._id,
              schools: b.schools,
              avgReading: Math.round(b.avgReading || 0),
              avgMath: Math.round(b.avgMath || 0),
              avgCertification: Math.round(b.avgCertification || 0),
              certified: b.certified,
            })),
          },
        });
        break;
      }
      default:
        sendSuccess(res, { data: { message: "Available report types: performance-summary, bottleneck-report, block-comparison" } });
    }
  }
);

export const getReportHistory = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    const notifications = await Notification.find({
      district,
      type: "report_ready",
    }).sort({ createdAt: -1 }).limit(20).lean();

    sendSuccess(res, { data: notifications });
  }
);
