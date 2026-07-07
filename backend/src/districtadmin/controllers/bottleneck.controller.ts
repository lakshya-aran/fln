import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { daAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getDistrictFromRequest } from "../middleware/districtAdminAuth";

const BOTTLENECK_DAYS = 7;
const CRITICAL_DAYS = 14;

export const getBottlenecks = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    const { block, severity } = req.query;

    const allSchools = await SchoolPerformance.find({
      district,
      pipelineStage: { $ne: null, $ne: "certified" },
      pipelineEnteredAt: { $ne: null },
    }).lean();

    const bottlenecks = allSchools.map(s => {
      const daysInStage = Math.floor(
        (Date.now() - new Date(s.pipelineEnteredAt!).getTime()) / (1000 * 60 * 60 * 24)
      );
      let severity: "normal" | "delayed" | "critical" = "normal";
      if (daysInStage >= CRITICAL_DAYS) severity = "critical";
      else if (daysInStage >= BOTTLENECK_DAYS) severity = "delayed";
      return {
        schoolId: s.schoolId,
        school: s.school,
        block: s.block,
        stage: s.pipelineStage,
        daysInStage,
        severity,
        readingScore: s.readingScore,
        mathScore: s.mathScore,
        assessmentCompletion: s.assessmentCompletion,
        flnCertification: s.flnCertification,
      };
    }).filter(b => b.severity !== "normal");

    let filtered = bottlenecks;
    if (block) filtered = filtered.filter(b => b.block === block);
    if (severity) filtered = filtered.filter(b => b.severity === severity);

    const delayed = filtered.filter(b => b.severity === "delayed");
    const critical = filtered.filter(b => b.severity === "critical");

    sendSuccess(res, {
      data: {
        bottlenecks: filtered,
        totalDelayed: delayed.length,
        totalCritical: critical.length,
        total: filtered.length,
      },
    });
  }
);
