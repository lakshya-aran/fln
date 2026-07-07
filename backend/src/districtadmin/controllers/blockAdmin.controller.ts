import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { daAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getDistrictFromRequest } from "../middleware/districtAdminAuth";

export const getBlockAdmins = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    const { search, block } = req.query;

    const filter: Record<string, unknown> = { district, role: "block_officer" };
    if (block) filter.block = block;

    const admins = await User.find(filter)
      .select("name email employeeId block assignedBlocks isActive lastLogin createdAt")
      .sort({ createdAt: -1 })
      .lean();

    let filtered = admins;
    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(s) || a.email.toLowerCase().includes(s)
      );
    }

    sendSuccess(res, { data: filtered });
  }
);

export const createBlockAdmin = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    const { name, email, employeeId, password, block, assignedBlocks } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existing) {
      sendError(res, "User with this email or employee ID already exists", 409);
      return;
    }

    const admin = new User({
      name, email, employeeId, password, role: "block_officer",
      district, assignedBlocks: assignedBlocks || [block].filter(Boolean),
    });
    await admin.save();

    sendSuccess(res, { data: { id: admin._id, name, email, employeeId, block, district } }, 201);
  }
);

export const updateBlockAdmin = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { name, block, assignedBlocks, isActive } = req.body;

    const update: Record<string, unknown> = {};
    if (name) update.name = name;
    if (block) update.block = block;
    if (assignedBlocks) update.assignedBlocks = assignedBlocks;
    if (isActive !== undefined) update.isActive = isActive;

    const admin = await User.findByIdAndUpdate(id, { $set: update }, { new: true })
      .select("name email employeeId block assignedBlocks isActive");

    if (!admin) {
      sendError(res, "Block admin not found", 404);
      return;
    }

    sendSuccess(res, { data: admin });
  }
);

export const deactivateBlockAdmin = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const admin = await User.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true })
      .select("name email isActive");

    if (!admin) {
      sendError(res, "Block admin not found", 404);
      return;
    }

    sendSuccess(res, { data: admin });
  }
);

export const resetBlockAdminPassword = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { password } = req.body;

    const admin = await User.findById(id).select("+password");
    if (!admin) {
      sendError(res, "Block admin not found", 404);
      return;
    }

    admin.password = password;
    await admin.save();

    sendSuccess(res, { message: "Password reset successful" });
  }
);
