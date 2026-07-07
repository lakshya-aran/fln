import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { Announcement } from "../models/Announcement";
import { createAuditLog } from "../services/audit.service";
import { announcementSchema } from "../validators";
import { saAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getAnnouncements = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { status, type } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    sendSuccess(res, { announcements });
  }
);

export const getAnnouncementById = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      sendError(res, "Announcement not found", 404);
      return;
    }
    sendSuccess(res, { announcement });
  }
);

export const createAnnouncement = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const data = announcementSchema.parse(req.body);
    const payload: Record<string, unknown> = {
      ...data,
      createdBy: req.user!.userId,
    };
    if (data.status === "published") {
      payload.publishedAt = new Date();
    }
    const announcement = await Announcement.create(payload);
    await createAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "national_admin",
      action: "CREATE_ANNOUNCEMENT",
      resource: "Announcement",
      resourceId: announcement._id.toString(),
      description: `Created announcement "${announcement.title}" [${announcement.status}]`,
    }, req);
    sendSuccess(res, { announcement }, 201);
  }
);

export const updateAnnouncement = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      sendError(res, "Announcement not found", 404);
      return;
    }
    const allowedUpdates = ["title", "content", "type", "status", "targetAudience", "scheduledAt", "sendEmail"];
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        (announcement as any)[field] = req.body[field];
      }
    }
    if (req.body.status === "published" && !announcement.publishedAt) {
      announcement.publishedAt = new Date();
    }
    await announcement.save();
    await createAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "national_admin",
      action: "UPDATE_ANNOUNCEMENT",
      resource: "Announcement",
      resourceId: announcement._id.toString(),
      description: `Updated announcement "${announcement.title}"`,
    }, req);
    sendSuccess(res, { announcement });
  }
);
