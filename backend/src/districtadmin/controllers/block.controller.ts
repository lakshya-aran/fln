import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { daAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getDistrictFromRequest } from "../middleware/districtAdminAuth";

export const getBlocks = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    const { search, sortBy, order } = req.query;

    const blocks = await User.distinct("block", { district, role: "block_officer" });
    const validBlocks = blocks.filter(Boolean);

    const blockData = await Promise.all(
      validBlocks.map(async (block: string) => {
        const [teachers, volunteers, performanceAgg] = await Promise.all([
          User.countDocuments({ district, block, role: "teacher" }),
          User.countDocuments({ district, block, role: "volunteer" }),
          SchoolPerformance.aggregate([
            { $match: { district, block } },
            {
              $group: {
                _id: null,
                schools: { $sum: 1 },
                avgCertification: { $avg: "$flnCertification" },
                avgCompletion: { $avg: "$assessmentCompletion" },
                avgReading: { $avg: "$readingScore" },
                avgMath: { $avg: "$mathScore" },
                inPipeline: { $sum: { $cond: [{ $ne: ["$pipelineStage", null] }, 1, 0] } },
                certified: { $sum: { $cond: [{ $eq: ["$pipelineStage", "certified"] }, 1, 0] } },
              },
            },
          ]),
        ]);

        const m = performanceAgg[0] || {};
        return {
          block,
          schools: m.schools || 0,
          teachers: teachers || 0,
          volunteers: volunteers || 0,
          flnCertification: Math.round(m.avgCertification || 0),
          assessmentCompletion: Math.round(m.avgCompletion || 0),
          readingScore: Math.round(m.avgReading || 0),
          mathScore: Math.round(m.avgMath || 0),
          inPipeline: m.inPipeline || 0,
          certified: m.certified || 0,
        };
      })
    );

    let filtered = blockData;
    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(b => b.block.toLowerCase().includes(s));
    }

    if (sortBy) {
      const key = sortBy as string;
      const dir = order === "desc" ? -1 : 1;
      filtered.sort((a: any, b: any) => {
        if ((a[key] ?? 0) < (b[key] ?? 0)) return -1 * dir;
        if ((a[key] ?? 0) > (b[key] ?? 0)) return 1 * dir;
        return 0;
      });
    }

    sendSuccess(res, { data: filtered });
  }
);
