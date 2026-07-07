import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { Feedback } from "../models/Feedback";
import { createAuditLog } from "../services/audit.service";
import { feedbackUpdateSchema } from "../validators";
import { saAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getFeedbacks = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { status, category, priority, source, search } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Feedback.countDocuments(filter),
    ]);
    sendSuccess(res, { feedbacks, total, page, totalPages: Math.ceil(total / limit) });
  }
);

export const updateFeedback = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const data = feedbackUpdateSchema.parse(req.body);
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      sendError(res, "Feedback not found", 404);
      return;
    }
    const before = { status: feedback.status, priority: feedback.priority };
    if (data.status) feedback.status = data.status;
    if (data.priority) feedback.priority = data.priority;
    if (data.assignedTo) feedback.assignedTo = data.assignedTo as any;
    if (data.resolution) feedback.resolution = data.resolution;
    if (data.duplicateOf) feedback.duplicateOf = data.duplicateOf as any;
    if (data.status === "resolved") feedback.resolvedAt = new Date();
    await feedback.save();
    await createAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "national_admin",
      action: "UPDATE_FEEDBACK",
      resource: "Feedback",
      resourceId: feedback._id.toString(),
      description: `Updated feedback "${feedback.title}" to ${feedback.status}`,
      before,
      after: { status: feedback.status, priority: feedback.priority },
    }, req);
    sendSuccess(res, { feedback });
  }
);
