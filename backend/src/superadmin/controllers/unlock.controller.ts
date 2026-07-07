import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { createAuditLog } from "../services/audit.service";
import { saAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const unlockSchool = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { email, reason } = req.body;
    if (!email || !reason) {
      sendError(res, "Email and reason are required", 400);
      return;
    }
    const user = await User.findOne({ email, role: "principal" });
    if (!user) {
      sendError(res, "School not found with that principal email", 404);
      return;
    }
    const before = { isActive: user.isActive };
    user.isActive = true;
    await user.save();
    await createAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "national_admin",
      action: "UNLOCK_SCHOOL",
      resource: "User",
      resourceId: user._id.toString(),
      description: `Unlocked school for ${email}. Reason: ${reason}`,
      before,
      after: { isActive: true },
    }, req);
    sendSuccess(res, { message: "School unlocked successfully", user: { id: user._id, name: user.name, email: user.email } });
  }
);

export const searchSchool = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const query = req.query.q as string;
    if (!query) {
      sendError(res, "Search query is required", 400);
      return;
    }
    const users = await User.find({
      role: "principal",
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { employeeId: { $regex: query, $options: "i" } },
      ],
    }).select("name email employeeId isActive");
    sendSuccess(res, { schools: users });
  }
);
