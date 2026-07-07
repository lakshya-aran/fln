import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { VolunteerAssignment } from "../models/VolunteerAssignment";
import { AssessmentSchedule } from "../models/AssessmentSchedule";
import { StudentRegistration } from "../models/StudentRegistration";
import { baAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getBlockFilter } from "../middleware/blockAdminAuth";

export const getAnalytics = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const u = req.user as any;

    const [schoolWise, volunteerActivity, assessmentTrend, learningOutcomes, studentGrowth, volunteerReliability] = await Promise.all([
      SchoolPerformance.find(blockFilter).select("school flnCertification readingScore mathScore assessmentCompletion").lean(),
      VolunteerAssignment.aggregate([
        { $match: { ...blockFilter, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$assignedAt" } },
            count: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      AssessmentSchedule.aggregate([
        { $match: { ...blockFilter, status: "completed" } },
        {
          $group: {
            _id: { $month: "$scheduledDate" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      SchoolPerformance.aggregate([
        { $match: blockFilter },
        {
          $group: {
            _id: "$block",
            avgReading: { $avg: "$readingScore" },
            avgMath: { $avg: "$mathScore" },
            avgCertification: { $avg: "$flnCertification" },
          },
        },
      ]),
      StudentRegistration.aggregate([
        { $match: { ...blockFilter, status: "approved" } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      VolunteerAssignment.aggregate([
        { $match: blockFilter },
        {
          $group: {
            _id: "$volunteerId",
            volunteerName: { $first: "$volunteerName" },
            reliability: { $avg: "$reliabilityScore" },
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          },
        },
        { $sort: { reliability: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const totalStudents = await SchoolPerformance.aggregate([
      { $match: blockFilter },
      { $group: { _id: null, total: { $sum: "$totalStudents" } } },
    ]);

    sendSuccess(res, {
      data: {
        block: u.block,
        cards: {
          schools: schoolWise.length,
          students: totalStudents[0]?.total || 0,
          teachers: await User.countDocuments({ ...blockFilter, role: "teacher" }),
          volunteers: await User.countDocuments({ ...blockFilter, role: "volunteer" }),
          certification: Math.round(schoolWise.reduce((s, x) => s + (x.flnCertification || 0), 0) / (schoolWise.length || 1)),
          assessmentCompletion: Math.round(schoolWise.reduce((s, x) => s + (x.assessmentCompletion || 0), 0) / (schoolWise.length || 1)),
          schoolsPending: schoolWise.filter(s => (s.assessmentCompletion || 0) < 40).length,
        },
        schoolComparison: schoolWise.map(s => ({
          school: s.school,
          flnCertification: s.flnCertification,
          readingScore: s.readingScore,
          mathScore: s.mathScore,
        })),
        volunteerActivity: volunteerActivity.map(v => ({ date: v._id, total: v.count, completed: v.completed })),
        assessmentTrend: assessmentTrend.map(a => ({
          month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][a._id - 1],
          count: a.count,
        })),
        learningOutcomes: learningOutcomes.map(l => ({
          block: l._id,
          reading: Math.round(l.avgReading || 0),
          math: Math.round(l.avgMath || 0),
          certification: Math.round(l.avgCertification || 0),
        })),
        studentGrowth: studentGrowth.map(s => ({
          month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][s._id - 1],
          count: s.count,
        })),
        volunteerReliability: volunteerReliability.map(v => ({
          volunteerId: v._id,
          name: v.volunteerName,
          reliability: Math.round(v.reliability || 0),
          total: v.total,
          completed: v.completed,
        })),
      },
    });
  }
);

export const getSchools = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { search, status } = req.query;
    const filter: Record<string, unknown> = { ...blockFilter };
    if (status) filter.completionStatus = status;
    let query = SchoolPerformance.find(filter).sort({ flnCertification: 1 });
    if (search) {
      query = query.where("school").regex(new RegExp(String(search), "i"));
    }
    const schools = await query.lean();
    sendSuccess(res, { data: schools });
  }
);

export const getSchoolById = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const school = await SchoolPerformance.findOne({ _id: req.params.id, ...blockFilter }).lean();
    if (!school) {
      sendSuccess(res, { data: null, message: "School not found in your block" });
      return;
    }
    const principal = await User.findOne({ school: school.school, block: school.block, role: "principal" }).select("name email isActive lastLogin lockReason").lean();
    const teachers = await User.countDocuments({ school: school.school, block: school.block, role: "teacher" });
    const volunteers = await User.countDocuments({ block: school.block, role: "volunteer" });
    sendSuccess(res, { data: { school, principal, teachers, volunteers } });
  }
);