import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { createStateAuditLog } from "../services/audit.service";
import { unlockSchoolSchema } from "../validators";
import { stAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getStateFromRequest } from "../middleware/stateAdminAuth";

export const getLockedSchools = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const { search } = req.query;
    const match: Record<string, unknown> = { state, role: "principal", isActive: false };
    if (search) {
      match.$or = [
        { name: { $regex: search as string, $options: "i" } },
        { email: { $regex: search as string, $options: "i" } },
        { school: { $regex: search as string, $options: "i" } },
        { employeeId: { $regex: search as string, $options: "i" } },
      ];
    }
    const locked = await User.find(match).select(
      "name email school district block employeeId lastLogin failedLoginAttempts lockReason lockedAt isActive"
    ).sort({ lockedAt: -1 });

    sendSuccess(res, {
      data: { schools: locked, total: locked.length },
    });
  }
);

export const unlockSchool = stAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const state = getStateFromRequest(req);
    const data = unlockSchoolSchema.parse(req.body);

    const user = await User.findOne({
      email: data.email,
      role: "principal",
      state,
    });
    if (!user) {
      sendError(res, "School principal not found in your state", 404);
      return;
    }

    const before = {
      isActive: user.isActive,
      lockReason: user.lockReason,
      lockedAt: user.lockedAt,
      failedLoginAttempts: user.failedLoginAttempts,
    };

    user.isActive = true;
    user.lockReason = "";
    user.lockedAt = null;
    user.failedLoginAttempts = 0;
    await user.save();

    await createStateAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "state_admin",
      action: "UNLOCK_SCHOOL",
      resource: "User",
      resourceId: user._id.toString(),
      description: `Unlocked school ${user.school} for principal ${user.email}. Reason: ${data.reason}`,
      before,
      after: { isActive: true, lockReason: "", failedLoginAttempts: 0 },
    }, req);

    sendSuccess(res, {
      data: {
        message: "School unlocked successfully",
        school: {
          _id: user._id,
          name: user.name,
          email: user.email,
          school: user.school,
          district: user.district,
        },
      },
    });
  }
);