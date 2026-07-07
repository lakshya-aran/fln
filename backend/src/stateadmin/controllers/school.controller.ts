import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { SchoolPerformance } from "../models/SchoolPerformance";
import { InfrastructureRequest } from "../models/InfrastructureRequest";
import { stAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getStateFromRequest } from "../middleware/stateAdminAuth";

export const getSchools = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const { search, district, block, status, page = 1, limit = 20 } = req.query;

    const match: Record<string, unknown> = { state };
    if (district) match.district = district;
    if (block) match.block = block;
    if (status) match.completionStatus = status;
    if (search) {
      match.school = { $regex: search as string, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [schools, total] = await Promise.all([
      SchoolPerformance.find(match)
        .sort({ flnCertification: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("district block school schoolId totalStudents totalTeachers totalVolunteers assessmentCompletion flnCertification readingScore mathScore completionStatus"),
      SchoolPerformance.countDocuments(match),
    ]);

    const principals = await User.find({
      state,
      role: "principal",
      ...(district ? { district } : {}),
      school: { $in: schools.map(s => s.school) },
    }).select("name email isActive lastLogin school district");

    const principalBySchool = new Map<string, any>();
    for (const p of principals) {
      principalBySchool.set(p.school, p);
    }

    const enriched = schools.map(s => {
      const principal = principalBySchool.get(s.school);
      return {
        _id: s.schoolId,
        name: s.school,
        district: s.district,
        block: s.block,
        students: s.totalStudents,
        teachers: s.totalTeachers,
        volunteers: s.totalVolunteers,
        assessmentCompletion: Math.round(s.assessmentCompletion || 0),
        flnCertification: Math.round(s.flnCertification || 0),
        readingScore: Math.round(s.readingScore || 0),
        mathScore: Math.round(s.mathScore || 0),
        completionStatus: s.completionStatus,
        principal: principal ? { name: principal.name, email: principal.email, isActive: principal.isActive, lastLogin: principal.lastLogin } : null,
      };
    });

    sendSuccess(res, {
      data: {
        schools: enriched,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

export const getSchoolById = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const { id } = req.params;

    const school = await SchoolPerformance.findOne({ schoolId: id, state });
    if (!school) {
      sendError(res, "School not found in your state", 404);
      return;
    }

    const [principal, teachers, volunteers, infrastructure] = await Promise.all([
      User.findOne({ state, role: "principal", school: school.school }).select("name email isActive lastLogin"),
      User.countDocuments({ state, role: "teacher", school: school.school }),
      User.countDocuments({ state, role: "volunteer", school: school.school }),
      InfrastructureRequest.find({ state, district: school.district, school: school.school }).sort({ createdAt: -1 }).limit(20),
    ]);

    sendSuccess(res, {
      data: {
        school: {
          _id: school.schoolId,
          name: school.school,
          district: school.district,
          block: school.block,
          state: school.state,
          students: school.totalStudents,
          teachers: school.totalTeachers,
          volunteers: school.totalVolunteers,
          assessmentCompletion: Math.round(school.assessmentCompletion || 0),
          flnCertification: Math.round(school.flnCertification || 0),
          readingScore: Math.round(school.readingScore || 0),
          mathScore: Math.round(school.mathScore || 0),
          completionStatus: school.completionStatus,
          lastUpdated: school.lastUpdated,
        },
        principal: principal || null,
        principalTeacherCount: teachers,
        volunteerCount: volunteers,
        infrastructureRequests: infrastructure,
      },
    });
  }
);