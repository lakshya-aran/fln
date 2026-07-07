import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { User } from "../../models/User";
import { QuestionReview } from "../models/QuestionReview";
import { Feedback } from "../models/Feedback";
import { saAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";

export const getAnalytics = saAsyncHandler(
  async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userRoleCounts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    const questionReviewStats = await QuestionReview.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const pendingReviews = await QuestionReview.countDocuments({
      failureRate: { $gte: 50 },
      difficulty: "easy",
    });

    const feedbackByCategory = await Feedback.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const feedbackByStatus = await Feedback.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const roleDistribution: Record<string, number> = {};
    for (const item of userRoleCounts) {
      roleDistribution[item._id] = item.count;
    }
    const reviewStatusCounts: Record<string, number> = {};
    for (const item of questionReviewStats) {
      reviewStatusCounts[item._id] = item.count;
    }
    const feedbackCategoryCounts: Record<string, number> = {};
    for (const item of feedbackByCategory) {
      feedbackCategoryCounts[item._id] = item.count;
    }
    const feedbackStatusCounts: Record<string, number> = {};
    for (const item of feedbackByStatus) {
      feedbackStatusCounts[item._id] = item.count;
    }

    sendSuccess(res, {
      data: {
        users: {
          total: await User.countDocuments(),
          active: activeUsers,
          inactive: inactiveUsers,
          byRole: roleDistribution,
        },
        questions: {
          pendingFlagged: pendingReviews,
          byStatus: reviewStatusCounts,
        },
        feedback: {
          byCategory: feedbackCategoryCounts,
          byStatus: feedbackStatusCounts,
        },
      },
    });
  }
);

export const getAssessmentStats = saAsyncHandler(
  async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const totalStudents = await User.countDocuments({ role: "student" });
    sendSuccess(res, {
      data: {
        totalStudents,
        assessmentCompletionRate: 0,
        learningOutcomesAchieved: 0,
        readingTrend: { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], values: [45, 48, 52, 55, 58, 62] },
        mathTrend: { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], values: [40, 43, 47, 50, 54, 58] },
        dropoutTrend: { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], values: [5, 4.8, 4.5, 4.2, 3.9, 3.5] },
      },
    });
  }
);
