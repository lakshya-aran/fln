import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { SchoolPerformance } from "../../stateadmin/models/SchoolPerformance";
import { SchoolRecovery } from "../models/SchoolRecovery";
import { baAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getBlockFilter } from "../middleware/blockAdminAuth";
import { createBlockAuditLog } from "../services/audit.service";

export const getLockedSchools = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const { search } = req.query;
    const filter: Record<string, unknown> = { ...blockFilter, role: "principal", isActive: false };
    if (search) {
      const s = String(search).toLowerCase();
      filter.$or = [
        { name: new RegExp(s, "i") },
        { email: new RegExp(s, "i") },
        { school: new RegExp(s, "i") },
      ];
    }
    const schools = await User.find(filter).select("name email school block lockReason lockedAt failedLoginAttempts employeeId").lean();
    sendSuccess(res, { data: schools });
  }
);

export const viewLockReason = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);
    const { email } = req.body;
    const school = await User.findOne({ email, ...blockFilter, role: "principal" }).select("name email school block lockReason lockedAt failedLoginAttempts isActive").lean();
    if (!school) {
      sendError(res, "School principal not found", 404);
      return;
    }
    await SchoolRecovery.create({
      block: school.block,
      district: u.assignedDistrict,
      state: u.assignedState,
      school: school.school,
      schoolId: school.email,
      principalEmail: school.email,
      action: "viewed_lock_reason",
      reason: "Block admin viewed lock reason",
      performedBy: u.name,
      performedById: u.userId,
      performedByRole: "block_officer",
      ip: req.ip || "",
      before: { lockReason: school.lockReason },
      after: {},
    });
    sendSuccess(res, { data: school });
  }
);

export const temporaryAccess = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);
    const { email, reason } = req.body;
    const school = await User.findOne({ email, ...blockFilter, role: "principal" }).select("name email school block isActive").lean();
    if (!school) {
      sendError(res, "School principal not found", 404);
      return;
    }
    await SchoolRecovery.create({
      block: school.block,
      district: u.assignedDistrict,
      state: u.assignedState,
      school: school.school,
      schoolId: school.email,
      principalEmail: school.email,
      action: "temporary_access",
      reason: reason || "Temporary access by block admin",
      performedBy: u.name,
      performedById: u.userId,
      performedByRole: "block_officer",
      ip: req.ip || "",
      before: { isActive: school.isActive },
      after: { temporaryAccess: true },
    });
    sendSuccess(res, { data: { message: "Temporary access granted (audited)", school } });
  }
);

export const resetLogin = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);
    const { email, reason } = req.body;
    const before = await User.findOne({ email, ...blockFilter, role: "principal" }).select("failedLoginAttempts lockReason isActive").lean();
    if (!before) {
      sendError(res, "School principal not found", 404);
      return;
    }
    const after = await User.findOneAndUpdate(
      { email, ...blockFilter, role: "principal" },
      { $set: { failedLoginAttempts: 0 }, $unset: { lockReason: "", lockedAt: "" } },
      { new: true }
    ).select("name email failedLoginAttempts isActive");

    await SchoolRecovery.create({
      block: u.block,
      district: u.assignedDistrict,
      state: u.assignedState,
      school: after?.email || "",
      schoolId: email,
      principalEmail: email,
      action: "reset_login",
      reason: reason || "Reset login by block admin",
      performedBy: u.name,
      performedById: u.userId,
      performedByRole: "block_officer",
      ip: req.ip || "",
      before: { failedLoginAttempts: before.failedLoginAttempts, lockReason: before.lockReason },
      after: { failedLoginAttempts: 0, lockReason: "" },
    });

    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: "reset_school_login",
        resource: "User",
        resourceId: email,
        description: `Reset login attempts for ${email}`,
        before: { failedLoginAttempts: before.failedLoginAttempts },
        after: { failedLoginAttempts: 0 },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );

    sendSuccess(res, { data: after });
  }
);

export const unlockSchool = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const blockFilter = getBlockFilter(req);
    const { email, reason, action } = req.body;
    if (!reason || reason.length < 5) {
      sendError(res, "Reason must be at least 5 characters", 400);
      return;
    }
    const before = await User.findOne({ email, ...blockFilter, role: "principal" }).select("failedLoginAttempts lockReason isActive").lean();
    if (!before) {
      sendError(res, "School principal not found", 404);
      return;
    }
    const after = await User.findOneAndUpdate(
      { email, ...blockFilter, role: "principal" },
      { $set: { isActive: true, failedLoginAttempts: 0 }, $unset: { lockReason: "", lockedAt: "" } },
      { new: true }
    ).select("name email isActive failedLoginAttempts");

    await SchoolRecovery.create({
      block: u.block,
      district: u.assignedDistrict,
      state: u.assignedState,
      school: after?.email || "",
      schoolId: email,
      principalEmail: email,
      action: action || "unlocked",
      reason,
      performedBy: u.name,
      performedById: u.userId,
      performedByRole: "block_officer",
      ip: req.ip || "",
      before: { isActive: before.isActive, failedLoginAttempts: before.failedLoginAttempts },
      after: { isActive: true, failedLoginAttempts: 0 },
    });

    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: "unlock_school",
        resource: "User",
        resourceId: email,
        description: `Unlocked school ${email}: ${reason}`,
        before: { isActive: before.isActive },
        after: { isActive: true },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );

    sendSuccess(res, { data: after });
  }
);

export const getRecoveryHistory = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blockFilter = getBlockFilter(req);
    const history = await SchoolRecovery.find(blockFilter).sort({ createdAt: -1 }).limit(50).lean();
    sendSuccess(res, { data: history });
  }
);