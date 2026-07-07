import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { BlockNotification } from "../models/BlockNotification";
import { baAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { getBlocksFromRequest } from "../middleware/blockAdminAuth";
import { createBlockAuditLog } from "../services/audit.service";

export const getNotifications = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blocks = getBlocksFromRequest(req);
    const { type, severity, read } = req.query;
    const filter: Record<string, unknown> = { block: { $in: blocks } };
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (read === "true") filter.read = true;
    else if (read === "false") filter.read = false;

    const notifications = await BlockNotification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unreadCount = await BlockNotification.countDocuments({ block: { $in: blocks }, read: false });
    sendSuccess(res, { data: { notifications, unreadCount } });
  }
);

export const createNotification = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const u = req.user as any;
    const { type, targetRole, targetSchoolId, title, message, severity } = req.body;

    const notif = await BlockNotification.create({
      block: u.block,
      district: u.assignedDistrict,
      state: u.assignedState,
      type,
      targetRole: targetRole || "all",
      targetSchoolId: targetSchoolId || null,
      title,
      message,
      severity: severity || "info",
      read: false,
      readBy: [],
    });

    await createBlockAuditLog(
      {
        user: u.name,
        userId: u.userId,
        userRole: "block_officer",
        action: "create_notification",
        resource: "BlockNotification",
        resourceId: String(notif._id),
        description: `Notification sent: ${title} (target: ${targetRole})`,
        after: { type, targetRole, title },
        block: u.block,
        district: u.assignedDistrict,
      },
      req
    );

    sendSuccess(res, { data: notif }, 201);
  }
);

export const markAsRead = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blocks = getBlocksFromRequest(req);
    const { id } = req.params;
    const updated = await BlockNotification.findOneAndUpdate(
      { _id: id, block: { $in: blocks } },
      { $set: { read: true } },
      { new: true }
    );
    if (!updated) {
      sendError(res, "Notification not found", 404);
      return;
    }
    sendSuccess(res, { data: updated });
  }
);

export const markAllAsRead = baAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const blocks = getBlocksFromRequest(req);
    const result = await BlockNotification.updateMany(
      { block: { $in: blocks }, read: false },
      { $set: { read: true } }
    );
    sendSuccess(res, { data: { modified: result.modifiedCount } });
  }
);