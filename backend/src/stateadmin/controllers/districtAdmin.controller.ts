import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { createStateAuditLog } from "../services/audit.service";
import {
  createDistrictAdminSchema,
  updateDistrictAdminSchema,
  resetDistrictAdminPasswordSchema,
} from "../validators";
import { stAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getStateFromRequest } from "../middleware/stateAdminAuth";
import bcrypt from "bcryptjs";
import { validate } from "../../middleware/validate";

export const getDistrictAdmins = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const { search, page = 1, limit = 20 } = req.query;
    const match: Record<string, unknown> = { state, role: "district_officer" };
    if (search) {
      match.$or = [
        { name: { $regex: search as string, $options: "i" } },
        { email: { $regex: search as string, $options: "i" } },
        { district: { $regex: search as string, $options: "i" } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [admins, total] = await Promise.all([
      User.find(match)
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(match),
    ]);
    sendSuccess(res, {
      data: {
        admins,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

export const createDistrictAdmin = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const data = req.body;
    if (!state) {
      sendError(res, "State admin must be assigned to a state", 400);
      return;
    }
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      sendError(res, "User with this email already exists", 409);
      return;
    }
    const admin = await User.create({
      ...data,
      role: "district_officer",
      state,
      district: data.assignedDistrict,
    });
    await createStateAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "state_admin",
      action: "CREATE_DISTRICT_ADMIN",
      resource: "User",
      resourceId: admin._id.toString(),
      description: `Created district admin ${admin.name} for ${admin.district}`,
      after: { name: admin.name, email: admin.email, district: admin.district },
    }, req);
    sendSuccess(res, { data: { admin } }, 201);
  }
);

export const updateDistrictAdmin = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== "district_officer" || admin.state !== state) {
      sendError(res, "District admin not found in your state", 404);
      return;
    }
    const before = { name: admin.name, isActive: admin.isActive, district: admin.district };
    Object.assign(admin, req.body);
    if (req.body.assignedDistrict) admin.district = req.body.assignedDistrict;
    await admin.save();
    await createStateAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "state_admin",
      action: "UPDATE_DISTRICT_ADMIN",
      resource: "User",
      resourceId: admin._id.toString(),
      description: `Updated district admin ${admin.name}`,
      before,
      after: { name: admin.name, isActive: admin.isActive, district: admin.district },
    }, req);
    sendSuccess(res, { data: { admin } });
  }
);

export const deactivateDistrictAdmin = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== "district_officer" || admin.state !== state) {
      sendError(res, "District admin not found in your state", 404);
      return;
    }
    const before = { isActive: admin.isActive };
    admin.isActive = !admin.isActive;
    await admin.save();
    await createStateAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "state_admin",
      action: admin.isActive ? "ACTIVATE_DISTRICT_ADMIN" : "DEACTIVATE_DISTRICT_ADMIN",
      resource: "User",
      resourceId: admin._id.toString(),
      description: `${admin.isActive ? "Activated" : "Deactivated"} district admin ${admin.name}`,
      before,
      after: { isActive: admin.isActive },
    }, req);
    sendSuccess(res, { data: { admin } });
  }
);

export const resetDistrictAdminPassword = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const admin = await User.findById(req.params.id).select("+password");
    if (!admin || admin.role !== "district_officer" || admin.state !== state) {
      sendError(res, "District admin not found in your state", 404);
      return;
    }
    const { password } = resetDistrictAdminPasswordSchema.parse(req.body);
    const salt = await bcrypt.genSalt(12);
    admin.password = await bcrypt.hash(password, salt);
    admin.failedLoginAttempts = 0;
    admin.isActive = true;
    admin.lockReason = "";
    admin.lockedAt = null;
    await admin.save();
    await createStateAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "state_admin",
      action: "RESET_DISTRICT_ADMIN_PASSWORD",
      resource: "User",
      resourceId: admin._id.toString(),
      description: `Reset password for district admin ${admin.name}`,
    }, req);
    sendSuccess(res, { data: { message: "Password reset successfully" } });
  }
);

export const getDistrictAdminLoginHistory = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const admin = await User.findById(req.params.id).select("name email lastLogin failedLoginAttempts isActive");
    if (!admin || admin.role !== "district_officer" || admin.state !== state) {
      sendError(res, "District admin not found in your state", 404);
      return;
    }
    sendSuccess(res, {
      data: {
        admin,
        loginHistory: [
          { timestamp: admin.lastLogin, status: admin.isActive ? "success" : "blocked" },
        ],
      },
    });
  }
);