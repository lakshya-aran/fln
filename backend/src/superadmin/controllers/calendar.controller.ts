import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { AssessmentCalendar } from "../models/AssessmentCalendar";
import { createAuditLog } from "../services/audit.service";
import { calendarSchema } from "../validators";
import { saAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getCalendars = saAsyncHandler(
  async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const calendars = await AssessmentCalendar.find().sort({ startDate: -1 });
    sendSuccess(res, { calendars });
  }
);

export const getCalendarById = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const calendar = await AssessmentCalendar.findById(req.params.id);
    if (!calendar) {
      sendError(res, "Calendar entry not found", 404);
      return;
    }
    sendSuccess(res, { calendar });
  }
);

export const createCalendar = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const data = calendarSchema.parse(req.body);
    data.createdBy = req.user!.userId as any;
    const calendar = await AssessmentCalendar.create(data);
    await createAuditLog(
      {
        user: req.user!.userId,
        userId: req.user!.userId,
        userRole: "national_admin",
        action: "CREATE_CALENDAR",
        resource: "AssessmentCalendar",
        resourceId: calendar._id.toString(),
        description: `Created ${calendar.cycle} assessment for ${calendar.academicYear}`,
      },
      req
    );
    sendSuccess(res, { calendar }, 201);
  }
);

export const updateCalendar = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const calendar = await AssessmentCalendar.findById(req.params.id);
    if (!calendar) {
      sendError(res, "Calendar entry not found", 404);
      return;
    }
    const before = {
      status: calendar.status,
      startDate: calendar.startDate,
      endDate: calendar.endDate,
    };
    const allowedUpdates = [
      "label", "description", "startDate", "endDate",
      "resultDate", "status", "isActive",
    ];
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        (calendar as any)[field] = req.body[field];
      }
    }
    await calendar.save();
    await createAuditLog(
      {
        user: req.user!.userId,
        userId: req.user!.userId,
        userRole: "national_admin",
        action: "UPDATE_CALENDAR",
        resource: "AssessmentCalendar",
        resourceId: calendar._id.toString(),
        description: `Updated ${calendar.cycle} assessment`,
        before,
        after: { status: calendar.status, startDate: calendar.startDate, endDate: calendar.endDate },
      },
      req
    );
    sendSuccess(res, { calendar });
  }
);
