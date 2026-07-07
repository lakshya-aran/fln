import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { QuestionPaper } from "../models/QuestionPaper";
import { VolunteerAssignment } from "../models/VolunteerAssignment";
import { AssessmentSchedule } from "../models/AssessmentSchedule";
import { StudentRegistration } from "../models/StudentRegistration";
import { PrintRequest } from "../models/PrintRequest";
import { BlockNotification } from "../models/BlockNotification";
import { baAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getBlocksFromRequest, getBlockFilter } from "../middleware/blockAdminAuth";

export const getDashboard = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blocks = getBlocksFromRequest(req);
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);

    const [
      schools,
      teachers,
      studentsAgg,
      volunteers,
      lockedPrincipals,
      questionPapers,
      pendingStudentRegs,
      schedulesCount,
      completedSchedules,
      performanceAgg,
      studentGrowthAgg,
    ] = await Promise.all([
      SchoolPerformance.countDocuments(blockFilter),
      User.countDocuments({ ...blockFilter, role: "teacher" }),
      SchoolPerformance.aggregate([
        { $match: blockFilter },
        { $group: { _id: null, total: { $sum: "$totalStudents" } } },
      ]),
      User.countDocuments({ ...blockFilter, role: "volunteer" }),
      User.countDocuments({ ...blockFilter, role: "principal", isActive: false }),
      QuestionPaper.countDocuments(blockFilter),
      StudentRegistration.countDocuments({ ...blockFilter, status: "pending" }),
      AssessmentSchedule.countDocuments({ ...blockFilter, status: { $in: ["scheduled", "confirmed"] } }),
      AssessmentSchedule.countDocuments({ ...blockFilter, status: "completed" }),
      SchoolPerformance.aggregate([
        { $match: blockFilter },
        {
          $group: {
            _id: null,
            avgAssessmentCompletion: { $avg: "$assessmentCompletion" },
            avgFLNCertification: { $avg: "$flnCertification" },
            avgReadingScore: { $avg: "$readingScore" },
            avgMathScore: { $avg: "$mathScore" },
            inPipeline: { $sum: { $cond: [{ $ne: ["$pipelineStage", null] }, 1, 0] } },
            certified: { $sum: { $cond: [{ $eq: ["$pipelineStage", "certified"] }, 1, 0] } },
            noInternet: { $sum: { $cond: [{ $lt: ["$infrastructureRequests", 2] }, 1, 0] } },
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
    ]);

    const totalStudents = studentsAgg[0]?.total ?? 0;
    const perf = performanceAgg[0] || {};
    const printPending = await PrintRequest.countDocuments({ ...blockFilter, status: "pending" });
    const schoolsPending = await SchoolPerformance.countDocuments({ ...blockFilter, completionStatus: { $in: ["pending", "in_progress"] } });
    const unreadNotifications = await BlockNotification.countDocuments({ block: { $in: blocks }, read: false });

    sendSuccess(res, {
      data: {
        blocks,
        district: u.assignedDistrict,
        state: u.assignedState,
        totalSchools: schools,
        teachers,
        students: totalStudents,
        volunteers,
        assessmentsScheduled: schedulesCount,
        assessmentsCompleted: completedSchedules,
        schoolsPending,
        questionPapersGenerated: questionPapers,
        schoolsWithoutInternet: perf.noInternet ?? 0,
        printRequestsPending: printPending,
        studentRegistrationsPending: pendingStudentRegs,
        lockedSchoolDashboards: lockedPrincipals,
        assessmentCompletion: Math.round(perf.avgAssessmentCompletion || 0),
        flnCertification: Math.round(perf.avgFLNCertification || 0),
        readingScore: Math.round(perf.avgReadingScore || 0),
        mathScore: Math.round(perf.avgMathScore || 0),
        schoolsInPipeline: perf.inPipeline ?? 0,
        certifiedSchools: perf.certified ?? 0,
        unreadNotifications,
        studentGrowth: studentGrowthAgg.map(s => ({ month: s._id, count: s.count })),
      },
    });
  }
);

export const getChartData = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);

    const schoolPerformance = await SchoolPerformance.find(blockFilter).select("school flnCertification readingScore mathScore").lean();
    const assessmentTrend = await AssessmentSchedule.aggregate([
      { $match: { ...blockFilter, status: "completed" } },
      {
        $group: {
          _id: { $month: "$scheduledDate" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const volunteerDist = await VolunteerAssignment.aggregate([
      { $match: { ...blockFilter, status: { $in: ["on_duty", "completed", "assignment_accepted"] } } },
      {
        $group: {
          _id: { block: "$block", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    const pipelineByStage = await SchoolPerformance.aggregate([
      { $match: { ...blockFilter, pipelineStage: { $ne: null } } },
      { $group: { _id: "$pipelineStage", count: { $sum: 1 } } },
    ]);

    const regTrend = await StudentRegistration.aggregate([
      { $match: blockFilter },
      {
        $group: {
          _id: { $month: "$createdAt" },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    sendSuccess(res, {
      data: {
        schoolPerformance: schoolPerformance.map(s => ({
          school: s.school,
          flnCertification: s.flnCertification,
          readingScore: s.readingScore,
          mathScore: s.mathScore,
        })),
        assessmentTrend: assessmentTrend.map(a => ({
          month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][a._id - 1],
          count: a.count,
        })),
        volunteerDist: volunteerDist.map(v => ({
          block: v._id.block,
          status: v._id.status,
          count: v.count,
        })),
        pipelineByStage: pipelineByStage.map(p => ({ stage: p._id, count: p.count })),
        regTrend: regTrend.map(r => ({
          month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][r._id - 1],
          pending: r.pending,
          approved: r.approved,
        })),
      },
    });
  }
);