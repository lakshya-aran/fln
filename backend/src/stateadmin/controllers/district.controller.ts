import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { SchoolPerformance } from "../models/SchoolPerformance";
import { InfrastructureRequest } from "../models/InfrastructureRequest";
import { stAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getStateFromRequest } from "../middleware/stateAdminAuth";

export const getDistricts = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const { search, sortBy = "certification", order = "desc", page = 1, limit = 20 } = req.query;

    const match: Record<string, unknown> = { state };
    if (search) {
      match.district = { $regex: search as string, $options: "i" };
    }

    const stats = await SchoolPerformance.aggregate([
      { $match: { state } },
      {
        $group: {
          _id: "$district",
          schools: { $sum: 1 },
          students: { $sum: "$totalStudents" },
          teachers: { $sum: "$totalTeachers" },
          volunteers: { $sum: "$totalVolunteers" },
          avgCompletion: { $avg: "$assessmentCompletion" },
          avgCertification: { $avg: "$flnCertification" },
        },
      },
    ]);

    const districtAdmins = await User.find({
      state,
      role: "district_officer",
      ...(search ? { district: { $regex: search as string, $options: "i" } } : {}),
    }).select("name email district isActive lastLogin");

    const adminByDistrict = new Map<string, any>();
    for (const a of districtAdmins) {
      if (a.district) adminByDistrict.set(a.district, a);
    }

    let districts = stats.map(s => {
      const admin = adminByDistrict.get(s._id);
      return {
        district: s._id,
        districtAdmin: admin ? { name: admin.name, email: admin.email, isActive: admin.isActive, lastLogin: admin.lastLogin } : null,
        schools: s.schools,
        teachers: s.teachers,
        students: s.students,
        volunteers: s.volunteers,
        assessmentCompletion: Math.round(s.avgCompletion || 0),
        flnCertification: Math.round(s.avgCertification || 0),
      };
    });

    if (search) {
      districts = districts.filter(d =>
        d.district.toLowerCase().includes((search as string).toLowerCase())
      );
    }

    districts.sort((a, b) => {
      const aVal = (a as any)[sortBy] ?? 0;
      const bVal = (b as any)[sortBy] ?? 0;
      return order === "asc" ? aVal - bVal : bVal - aVal;
    });

    const skip = (Number(page) - 1) * Number(limit);
    const paginated = districts.slice(skip, skip + Number(limit));

    sendSuccess(res, {
      data: {
        districts: paginated,
        total: districts.length,
        page: Number(page),
        totalPages: Math.ceil(districts.length / Number(limit)),
      },
    });
  }
);

export const getDistrictById = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const { id } = req.params;

    const stats = await SchoolPerformance.aggregate([
      { $match: { state, district: id } },
      {
        $group: {
          _id: null,
          schools: { $sum: 1 },
          students: { $sum: "$totalStudents" },
          teachers: { $sum: "$totalTeachers" },
          volunteers: { $sum: "$totalVolunteers" },
          avgCompletion: { $avg: "$assessmentCompletion" },
          avgCertification: { $avg: "$flnCertification" },
          avgReading: { $avg: "$readingScore" },
          avgMath: { $avg: "$mathScore" },
        },
      },
    ]);

    const admin = await User.findOne({
      state,
      district: id,
      role: "district_officer",
    }).select("name email isActive lastLogin");

    const blocks = await SchoolPerformance.distinct("block", { state, district: id });
    const infrastructureCount = await InfrastructureRequest.countDocuments({
      state,
      district: id,
      status: { $in: ["pending", "approved", "in_progress"] },
    });

    const schoolsList = await SchoolPerformance.find({ state, district: id })
      .select("school schoolId assessmentCompletion flnCertification completionStatus")
      .sort({ flnCertification: -1 });

    const topPerformers = schoolsList.slice(0, 5).map(s => ({
      name: s.school,
      certification: Math.round(s.flnCertification || 0),
    }));
    const bottomPerformers = schoolsList.slice(-5).reverse().map(s => ({
      name: s.school,
      certification: Math.round(s.flnCertification || 0),
    }));

    const metrics = stats[0] || {
      schools: 0,
      students: 0,
      teachers: 0,
      volunteers: 0,
      avgCompletion: 0,
      avgCertification: 0,
      avgReading: 0,
      avgMath: 0,
    };

    sendSuccess(res, {
      data: {
        district: id,
        state,
        districtAdmin: admin ? { name: admin.name, email: admin.email, isActive: admin.isActive, lastLogin: admin.lastLogin } : null,
        blocks: blocks.filter(Boolean).length,
        schools: metrics.schools,
        teachers: metrics.teachers,
        students: metrics.students,
        volunteers: metrics.volunteers,
        assessmentCompletion: Math.round(metrics.avgCompletion || 0),
        flnCertification: Math.round(metrics.avgCertification || 0),
        readingScore: Math.round(metrics.avgReading || 0),
        mathScore: Math.round(metrics.avgMath || 0),
        infrastructureRequests: infrastructureCount,
        topPerformers,
        bottomPerformers,
        schools: schoolsList.map(s => ({
          name: s.school,
          schoolId: s.schoolId,
          assessmentCompletion: Math.round(s.assessmentCompletion || 0),
          flnCertification: Math.round(s.flnCertification || 0),
          completionStatus: s.completionStatus,
        })),
      },
    });
  }
);