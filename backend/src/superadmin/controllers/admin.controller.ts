import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { Admin } from "../models/Admin";
import { createAuditLog } from "../services/audit.service";
import { createAdminSchema, updateAdminSchema } from "../validators";
import { saAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const createAdmin = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const data = createAdminSchema.parse(req.body);
    const existing = await Admin.findOne({ email: data.email });
    if (existing) {
      sendError(res, "Admin with this email already exists", 409);
      return;
    }
    const admin = await Admin.create({ ...data, createdBy: req.user!.userId });
    await createAuditLog(
      {
        user: req.user!.userId,
        userId: req.user!.userId,
        userRole: "national_admin",
        action: "CREATE_ADMIN",
        resource: "Admin",
        resourceId: admin._id.toString(),
        description: `Created admin ${admin.name} (${admin.email})`,
        after: { name: admin.name, email: admin.email, role: admin.role },
      },
      req
    );
    sendSuccess(res, { admin }, 201);
  }
);

export const getAdmins = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (page - 1) * limit;
    const [admins, total] = await Promise.all([
      Admin.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Admin.countDocuments(filter),
    ]);
    sendSuccess(res, { admins, total, page, totalPages: Math.ceil(total / limit) });
  }
);

export const getAdminById = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      sendError(res, "Admin not found", 404);
      return;
    }
    sendSuccess(res, { admin });
  }
);

export const updateAdmin = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const data = updateAdminSchema.parse(req.body);
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      sendError(res, "Admin not found", 404);
      return;
    }
    const before = { name: admin.name, email: admin.email, isActive: admin.isActive };
    Object.assign(admin, data);
    await admin.save();
    await createAuditLog(
      {
        user: req.user!.userId,
        userId: req.user!.userId,
        userRole: "national_admin",
        action: "UPDATE_ADMIN",
        resource: "Admin",
        resourceId: admin._id.toString(),
        description: `Updated admin ${admin.name}`,
        before,
        after: { name: admin.name, email: admin.email, isActive: admin.isActive },
      },
      req
    );
    sendSuccess(res, { admin });
  }
);

export const deactivateAdmin = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      sendError(res, "Admin not found", 404);
      return;
    }
    const before = { isActive: admin.isActive };
    admin.isActive = !admin.isActive;
    await admin.save();
    await createAuditLog(
      {
        user: req.user!.userId,
        userId: req.user!.userId,
        userRole: "national_admin",
        action: admin.isActive ? "ACTIVATE_ADMIN" : "DEACTIVATE_ADMIN",
        resource: "Admin",
        resourceId: admin._id.toString(),
        description: `${admin.isActive ? "Activated" : "Deactivated"} admin ${admin.name}`,
        before,
        after: { isActive: admin.isActive },
      },
      req
    );
    sendSuccess(res, { admin });
  }
);

export const resetAdminPassword = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { password } = req.body;
    if (!password || password.length < 8) {
      sendError(res, "Password must be at least 8 characters", 400);
      return;
    }
    const admin = await Admin.findById(req.params.id).select("+password");
    if (!admin) {
      sendError(res, "Admin not found", 404);
      return;
    }
    admin.password = password;
    await admin.save();
    await createAuditLog(
      {
        user: req.user!.userId,
        userId: req.user!.userId,
        userRole: "national_admin",
        action: "RESET_ADMIN_PASSWORD",
        resource: "Admin",
        resourceId: admin._id.toString(),
        description: `Reset password for admin ${admin.name}`,
      },
      req
    );
    sendSuccess(res, { message: "Password reset successfully" });
  }
);
