import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { daAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getDistrictFromRequest } from "../middleware/districtAdminAuth";

export const getSchools = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    const { search, block, stage, status } = req.query;

    const filter: Record<string, unknown> = { district };
    if (block) filter.block = block;
    if (stage) filter.pipelineStage = stage;
    if (status) filter.completionStatus = status;

    const performances = await SchoolPerformance.find(filter as any).lean();

    const schools = performances.map(p => ({
      _id: p._id,
      name: p.school,
      email: p.schoolId,
      school: p.school,
      block: p.block,
      isActive: true,
      assessmentCompletion: p.assessmentCompletion ?? 0,
      flnCertification: p.flnCertification ?? 0,
      readingScore: p.readingScore ?? 0,
      mathScore: p.mathScore ?? 0,
      completionStatus: p.completionStatus ?? "pending",
      pipelineStage: p.pipelineStage ?? null,
      daysInCurrentStage: p.pipelineEnteredAt
        ? Math.floor((Date.now() - new Date(p.pipelineEnteredAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    }));

    let filtered = schools;
    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(sch =>
        sch.name.toLowerCase().includes(s) ||
        sch.school.toLowerCase().includes(s) ||
        sch.block.toLowerCase().includes(s)
      );
    }

    sendSuccess(res, { data: filtered });
  }
);
