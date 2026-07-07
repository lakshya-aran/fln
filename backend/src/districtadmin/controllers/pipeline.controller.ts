import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { daAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getDistrictFromRequest } from "../middleware/districtAdminAuth";

export const getPipelineStatus = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    const { block } = req.query;

    const filter: Record<string, unknown> = { district, pipelineStage: { $ne: null } };
    if (block) filter.block = block;

    const pipelineData = await SchoolPerformance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$pipelineStage",
          schools: { $push: { school: "$school", block: "$block", schoolId: "$schoolId", pipelineEnteredAt: "$pipelineEnteredAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const stages = ["assessment_conducted", "uploaded", "scanning", "evaluation", "outcomes", "certified"];
    const stageLabels: Record<string, string> = {
      assessment_conducted: "Assessment Conducted",
      uploaded: "Uploaded",
      scanning: "Scanning",
      evaluation: "Evaluation",
      outcomes: "Outcomes",
      certified: "Certified",
    };

    const result = stages.map(stage => {
      const found = pipelineData.find(p => p._id === stage);
      return {
        stage,
        label: stageLabels[stage],
        count: found?.count ?? 0,
        schools: found?.schools ?? [],
      };
    });

    const totals = await SchoolPerformance.countDocuments({ district });

    const totalInPipeline = result.reduce((sum, r) => sum + r.count, 0);
    const stagePercentage = stages.map(stage => {
      const found = pipelineData.find(p => p._id === stage);
      return {
        stage,
        label: stageLabels[stage],
        count: found?.count ?? 0,
        percentage: totals > 0 ? Math.round(((found?.count ?? 0) / totals) * 100) : 0,
      };
    });

    sendSuccess(res, {
      data: {
        pipeline: result,
        stagePercentage,
        totalInPipeline,
        totalSchools: totals,
        notStarted: totals - totalInPipeline,
      },
    });
  }
);
