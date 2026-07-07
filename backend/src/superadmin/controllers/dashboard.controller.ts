import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { AssessmentCalendar } from "../models/AssessmentCalendar";
import { Curriculum } from "../models/Curriculum";
import { QuestionReview } from "../models/QuestionReview";
import { Feedback } from "../models/Feedback";
import { saAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";

export const getDashboard = saAsyncHandler(
  async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalAdmins = await User.countDocuments({ role: "national_admin" });
    const calendarEntries = await AssessmentCalendar.countDocuments({ isActive: true });
    const curricula = await Curriculum.countDocuments();
    const pendingReviews = await QuestionReview.countDocuments({ status: "pending" });
    const openFeedback = await Feedback.countDocuments({ status: "open" });

    sendSuccess(res, {
      data: {
        totalUsers,
        activeUsers,
        totalAdmins,
        calendarEntries,
        curricula,
        pendingReviews,
        openFeedback,
      },
    });
  }
);

export const getNationwideStats = saAsyncHandler(
  async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const states = await User.distinct("state").then((s) => s.filter(Boolean).length);
    const roleCounts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const stats: Record<string, number> = {
      states: states || 36,
      districts: 0,
      blocks: 0,
      schools: 0,
    };

    for (const item of roleCounts) {
      stats[item._id + "s"] = item.count;
    }

    sendSuccess(res, { data: stats });
  }
);
