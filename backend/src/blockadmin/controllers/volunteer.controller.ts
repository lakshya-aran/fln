import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { VolunteerAssignment } from "../models/VolunteerAssignment";
import { baAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getBlockFilter } from "../middleware/blockAdminAuth";
import { createBlockAuditLog } from "../services/audit.service";

export const getVolunteers = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { search, status, school, isActive } = req.query;
    const filter: Record<string, unknown> = { ...blockFilter, role: "volunteer" };
    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;

    const volunteers = await User.find(filter)
      .select("name email employeeId block school isActive lastLogin createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const assignmentFilter: Record<string, unknown> = { ...blockFilter };
    if (status) assignmentFilter.status = status;
    if (school) assignmentFilter.school = school;
    const assignments = await VolunteerAssignment.find(assignmentFilter).lean();

    let result = volunteers.map(v => {
      const myAssignments = assignments.filter(a => a.volunteerId === v._id.toString() || a.volunteerEmail === v.email);
      const latest = myAssignments.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())[0];
      return {
        _id: v._id,
        name: v.name,
        email: v.email,
        employeeId: v.employeeId,
        block: v.block,
        school: v.school,
        isActive: v.isActive,
        lastLogin: v.lastLogin,
        createdAt: v.createdAt,
        status: latest?.status || "available",
        reliabilityScore: latest?.reliabilityScore ?? 80,
        assignmentCount: myAssignments.length,
        completedCount: myAssignments.filter(a => a.status === "completed").length,
        currentAssignment: latest
          ? {
              school: latest.school,
              stage: latest.assignmentStage,
              assignedAt: latest.assignedAt,
            }
          : null,
      };
    });

    if (search) {
      const s = String(search).toLowerCase();
      result = result.filter(v =>
        v.name.toLowerCase().includes(s) ||
        v.email.toLowerCase().includes(s) ||
        v.employeeId.toLowerCase().includes(s)
      );
    }
    if (status) {
      result = result.filter(v => v.status === status);
    }

    sendSuccess(res, { data: result });
  }
);

export const getVolunteerById = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const blockFilter = getBlockFilter(req);
    const volunteer = await User.findOne({ _id: id, ...blockFilter, role: "volunteer" }).select("-password -refreshToken").lean();
    if (!volunteer) {
      sendError(res, "Volunteer not found in your block", 404);
      return;
    }
    const assignments = await VolunteerAssignment.find({ volunteerId: id, ...blockFilter })
      .sort({ assignedAt: -1 })
      .lean();
    sendSuccess(res, { data: { volunteer, assignments } });
  }
);

export const updateVolunteer = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const blockFilter = getBlockFilter(req);
    const before = await User.findOne({ _id: id, ...blockFilter, role: "volunteer" }).select("isActive").lean();
    if (!before) {
      sendError(res, "Volunteer not found in your block", 404);
      return;
    }
    const { isActive } = req.body;
    if (isActive === undefined) {
      sendError(res, "Provide isActive field", 400);
      return;
    }
    const after = await User.findByIdAndUpdate(id, { $set: { isActive } }, { new: true }).select("name email isActive");
    const u = req.user as any;
    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: isActive ? "activate_volunteer" : "deactivate_volunteer",
        resource: "User",
        resourceId: id,
        description: `Block admin ${isActive ? "activated" : "deactivated"} volunteer`,
        before: { isActive: before.isActive },
        after: { isActive },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );
    sendSuccess(res, { data: after });
  }
);

export const emergencyReplacement = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { assignmentId, replacementVolunteerId, replacementVolunteerName, replacementVolunteerEmail, reason } = req.body;

    const assignment = await VolunteerAssignment.findOne({ _id: assignmentId, ...blockFilter });
    if (!assignment) {
      sendError(res, "Assignment not found", 404);
      return;
    }
    if (assignment.status === "completed") {
      sendError(res, "Assignment already completed", 400);
      return;
    }

    assignment.status = "completed";
    assignment.notes = `Emergency replacement: ${reason || "Not specified"}`;
    assignment.completedAt = new Date();
    await assignment.save();

    const newAssignment = await VolunteerAssignment.create({
      block: assignment.block,
      district: assignment.district,
      state: assignment.state,
      volunteerId: replacementVolunteerId,
      volunteerName: replacementVolunteerName,
      volunteerEmail: replacementVolunteerEmail,
      school: assignment.school,
      schoolId: assignment.schoolId,
      assignmentStage: "locked",
      status: "slot_locked",
      reliabilityScore: 80,
      emergencyReplacement: true,
      replacedBy: replacementVolunteerId,
      notes: `Replaces volunteer ${assignment.volunteerName}: ${reason || "Emergency"}`,
    });

    const u = req.user as any;
    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: "emergency_replacement",
        resource: "VolunteerAssignment",
        resourceId: String(assignment._id),
        description: `Emergency replacement for ${assignment.school}`,
        before: { volunteer: assignment.volunteerName },
        after: { volunteer: replacementVolunteerName },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );

    sendSuccess(res, { data: { oldAssignment: assignment, newAssignment } });
  }
);