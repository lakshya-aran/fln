import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { AuditLog } from "../models/AuditLog";
import { saAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";

export const getAuditLogs = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { action, resource, userId, startDate, endDate } = req.query;
    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate as string);
      if (endDate) (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate as string);
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter),
    ]);
    sendSuccess(res, { logs, total, page, totalPages: Math.ceil(total / limit) });
  }
);
