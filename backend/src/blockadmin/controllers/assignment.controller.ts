import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { VolunteerAssignment } from "../models/VolunteerAssignment";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { baAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getBlockFilter } from "../middleware/blockAdminAuth";
import { createBlockAuditLog } from "../services/audit.service";

export const listNearbySchools = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const schools = await SchoolPerformance.find({
      ...blockFilter,
      pipelineStage: { $ne: "certified", $ne: null },
    })
      .select("school schoolId block flnCertification assessmentCompletion")
      .lean();
    sendSuccess(res, { data: schools });
  }
);

export const assignVolunteer = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);
    const { volunteerId, volunteerName, volunteerEmail, school, schoolId, availability, notes } = req.body;

    if (!u.blocks.includes(req.body.block) && !school) {
      // ensure school is in assigned blocks
    }

    const existing = await VolunteerAssignment.findOne({ ...blockFilter, volunteerId, schoolId, status: { $nin: ["completed"] } });
    if (existing) {
      sendError(res, "Active assignment already exists", 409);
      return;
    }

    const assignment = await VolunteerAssignment.create({
      block: u.block,
      district: u.assignedDistrict,
      state: u.assignedState,
      volunteerId,
      volunteerName,
      volunteerEmail,
      school,
      schoolId,
      assignmentStage: "accepted",
      status: "assignment_accepted",
      availability: availability || "weekday",
      acceptedAt: new Date(),
      notes: notes || "",
    });

    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: "assign_volunteer",
        resource: "VolunteerAssignment",
        resourceId: String(assignment._id),
        description: `Assigned ${volunteerName} to ${school}`,
        after: { volunteer: volunteerName, school },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );

    sendSuccess(res, { data: assignment }, 201);
  }
);

export const updateAssignmentStage = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);
    const { id } = req.params;
    const { assignmentStage, status, reliabilityScore, notes } = req.body;

    const before = await VolunteerAssignment.findOne({ _id: id, ...blockFilter }).lean();
    if (!before) {
      sendError(res, "Assignment not found", 404);
      return;
    }

    const update: Record<string, unknown> = {};
    if (assignmentStage) update.assignmentStage = assignmentStage;
    if (status) update.status = status;
    if (reliabilityScore !== undefined) update.reliabilityScore = reliabilityScore;
    if (notes !== undefined) update.notes = notes;
    if (status === "completed") update.completedAt = new Date();

    const after = await VolunteerAssignment.findByIdAndUpdate(id, { $set: update }, { new: true });

    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: "update_assignment",
        resource: "VolunteerAssignment",
        resourceId: id,
        before: { stage: before.assignmentStage, status: before.status },
        after: { stage: update.assignmentStage, status: update.status },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );

    sendSuccess(res, { data: after });
  }
);

export const getAssignments = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { status, school, volunteerId } = req.query;
    const filter: Record<string, unknown> = { ...blockFilter };
    if (status) filter.status = status;
    if (school) filter.school = school;
    if (volunteerId) filter.volunteerId = volunteerId;

    const assignments = await VolunteerAssignment.find(filter).sort({ assignedAt: -1 }).limit(100).lean();
    sendSuccess(res, { data: assignments });
  }
);

export const getAssignmentById = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const assignment = await VolunteerAssignment.findOne({ _id: req.params.id, ...blockFilter }).lean();
    if (!assignment) {
      sendError(res, "Assignment not found", 404);
      return;
    }
    sendSuccess(res, { data: assignment });
  }
);