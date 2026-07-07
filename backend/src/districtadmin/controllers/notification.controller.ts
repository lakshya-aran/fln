import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { Notification } from "../models/Notification";
import { daAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getDistrictFromRequest } from "../middleware/districtAdminAuth";

export const getNotifications = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    const { type, severity, read } = req.query;

    const filter: Record<string, unknown> = { district };
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (read === "true") filter.read = true;
    else if (read === "false") filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ district, read: false });

    sendSuccess(res, { data: { notifications, unreadCount } });
  }
);

export const markAsRead = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { $set: { read: true } });
    sendSuccess(res, { message: "Notification marked as read" });
  }
);

export const markAllAsRead = daAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const district = getDistrictFromRequest(req);
    await Notification.updateMany({ district, read: false }, { $set: { read: true } });
    sendSuccess(res, { message: "All notifications marked as read" });
  }
);
