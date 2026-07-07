import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { SchoolPerformance } from "../models/SchoolPerformance";
import { InfrastructureRequest } from "../models/InfrastructureRequest";
import { stAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getStateFromRequest } from "../middleware/stateAdminAuth";

export const getLowPerformingDistricts = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);

    const result = await SchoolPerformance.aggregate([
      { $match: { state, flnCertification: { $lt: 40 } } },
      {
        $group: {
          _id: "$district",
          avgCertification: { $avg: "$flnCertification" },
          avgCompletion: { $avg: "$assessmentCompletion" },
          schools: { $sum: 1 },
          pendingSchools: {
            $sum: {
              $cond: [{ $eq: ["$completionStatus", "pending"] }, 1, 0],
            },
          },
          totalStudents: { $sum: "$totalStudents" },
          totalTeachers: { $sum: "$totalTeachers" },
        },
      },
      { $sort: { avgCertification: 1 } },
    ]);

    const enriched = result.map(r => ({
      district: r._id,
      certification: Math.round(r.avgCertification || 0),
      assessmentCompletion: Math.round(r.avgCompletion || 0),
      schools: r.schools,
      pendingSchools: r.pendingSchools,
      totalStudents: r.totalStudents,
      totalTeachers: r.totalTeachers,
      priority:
        r.avgCertification < 20
          ? "critical"
          : r.avgCertification < 30
          ? "high"
          : "medium",
      suggestedAction:
        r.avgCertification < 20
          ? "Immediate intervention required. Schedule state-level review meeting."
          : r.avgCertification < 30
          ? "Send notice to district admin. Review school-level challenges."
          : "Provide targeted support and monitor weekly progress.",
    }));

    sendSuccess(res, { data: { districts: enriched, total: enriched.length } });
  }
);

export const getInfrastructureRequests = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const { status, category } = req.query;
    const match: Record<string, unknown> = { state };
    if (status) match.status = status;
    if (category) match.category = category;

    const requests = await InfrastructureRequest.find(match)
      .sort({ createdAt: -1 })
      .limit(100);

    sendSuccess(res, { data: { requests } });
  }
);

export const getCertificationByDistrict = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const cert = await SchoolPerformance.aggregate([
      { $match: { state } },
      {
        $group: {
          _id: "$district",
          certification: { $avg: "$flnCertification" },
          completion: { $avg: "$assessmentCompletion" },
          schools: { $sum: 1 },
        },
      },
      { $sort: { certification: -1 } },
    ]);
    sendSuccess(res, {
      data: {
        districts: cert.map(c => ({
          district: c._id,
          certification: Math.round(c.certification || 0),
          completion: Math.round(c.completion || 0),
          schools: c.schools,
        })),
      },
    });
  }
);