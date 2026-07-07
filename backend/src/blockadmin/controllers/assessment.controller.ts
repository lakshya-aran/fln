import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { AssessmentSchedule } from "../models/AssessmentSchedule";
import { BlockNotification } from "../models/BlockNotification";
import { baAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getBlockFilter } from "../middleware/blockAdminAuth";
import { createBlockAuditLog } from "../services/audit.service";

export const getSchedules = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { status, schoolId, from, to } = req.query;
    const filter: Record<string, unknown> = { ...blockFilter };
    if (status) filter.status = status;
    if (schoolId) filter.schoolId = schoolId;
    if (from || to) {
      filter.scheduledDate = {};
      if (from) (filter.scheduledDate as Record<string, unknown>).$gte = new Date(String(from));
      if (to) (filter.scheduledDate as Record<string, unknown>).$lte = new Date(String(to));
    }
    const schedules = await AssessmentSchedule.find(filter).sort({ scheduledDate: 1 }).limit(100).lean();
    sendSuccess(res, { data: schedules });
  }
);

export const scheduleAssessment = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);
    const { schoolId, school, subject, grade, scheduledDate, session, volunteerId, notes } = req.body;

    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      sendError(res, "Invalid scheduledDate", 400);
      return;
    }

    const existing = await AssessmentSchedule.findOne({
      ...blockFilter,
      schoolId,
      subject,
      grade,
      scheduledDate: date,
      status: { $nin: ["cancelled"] },
    });
    if (existing) {
      sendError(res, "An assessment is already scheduled for this school/subject/grade/date", 409);
      return;
    }

    let volunteerName: string | null = null;
    if (volunteerId) {
      const { User } = await import("../../models/User");
      const volunteer = await User.findById(volunteerId).select("name").lean();
      volunteerName = volunteer?.name || null;
    }

    const schedule = await AssessmentSchedule.create({
      block: u.block,
      district: u.assignedDistrict,
      state: u.assignedState,
      school,
      schoolId,
      subject,
      grade,
      scheduledDate: date,
      session: session || "morning",
      volunteerId: volunteerId || null,
      volunteerName,
      status: "confirmed",
      locked: true,
      scheduledBy: u.name,
      scheduledById: u.userId,
      notes: notes || "",
    });

    if (volunteerId) {
      await BlockNotification.create({
        block: u.block,
        district: u.assignedDistrict,
        state: u.assignedState,
        type: "assessment",
        targetRole: "volunteers",
        title: `Assessment scheduled: ${school}`,
        message: `${subject} grade ${grade} on ${date.toLocaleDateString()} (${session || "morning"})`,
        severity: "info",
        targetSchoolId: schoolId,
      });
      schedule.notificationSent = true;
      await schedule.save();
    }

    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: "schedule_assessment",
        resource: "AssessmentSchedule",
        resourceId: String(schedule._id),
        description: `Scheduled ${subject} grade ${grade} for ${school} on ${date.toLocaleDateString()}`,
        after: { school, subject, grade, scheduledDate: date, session, locked: true },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );

    sendSuccess(res, { data: schedule }, 201);
  }
);

export const updateScheduleStatus = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { id } = req.params;
    const { status } = req.body;
    const valid = ["scheduled", "confirmed", "completed", "cancelled"];
    if (!valid.includes(status)) {
      sendError(res, "Invalid status", 400);
      return;
    }
    const before = await AssessmentSchedule.findOne({ _id: id, ...blockFilter }).lean();
    if (!before) {
      sendError(res, "Schedule not found", 404);
      return;
    }
    if (before.locked && status === "cancelled") {
      sendError(res, "Schedule is locked and cannot be cancelled", 400);
      return;
    }
    const updated = await AssessmentSchedule.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    sendSuccess(res, { data: updated });
  }
);

export const getAssessmentPipeline = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const schedules = await AssessmentSchedule.find(blockFilter).sort({ scheduledDate: 1 }).lean();
    const stages = ["question_generated", "printed", "delivered", "exam_conducted", "answer_uploaded", "evaluation", "certification"];
    const stageMap: Record<string, number> = {};
    for (const s of stages) stageMap[s] = 0;
    for (const sch of schedules) {
      let stage = "question_generated";
      if (sch.status === "completed") stage = "evaluation";
      stageMap[stage] = (stageMap[stage] || 0) + 1;
    }
    const pipeline = stages.map(stage => ({
      stage,
      label: stage.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      count: stageMap[stage] || 0,
      schedules: schedules.filter(sch => {
        if (stage === "question_generated") return true;
        if (stage === "printed") return sch.printedAt || sch.status !== "scheduled";
        if (stage === "completed" && sch.status === "completed") return true;
        return false;
      }).map(s => ({
        id: s._id,
        school: s.school,
        subject: s.subject,
        grade: s.grade,
        scheduledDate: s.scheduledDate,
        status: s.status,
        daysOverdue: Math.max(0, Math.floor((Date.now() - new Date(s.scheduledDate).getTime()) / (1000 * 60 * 60 * 24))),
      })),
    }));
    sendSuccess(res, { data: { pipeline, total: schedules.length } });
  }
);