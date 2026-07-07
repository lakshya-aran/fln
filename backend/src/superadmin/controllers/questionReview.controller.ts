import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types";
import { QuestionReview } from "../models/QuestionReview";
import { createAuditLog } from "../services/audit.service";
import { questionReviewSchema } from "../validators";
import { saAsyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getQuestionReviews = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { status, subject, grade, difficulty } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;
    if (difficulty) filter.difficulty = difficulty;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      QuestionReview.find(filter).sort({ failureRate: -1 }).skip(skip).limit(limit),
      QuestionReview.countDocuments(filter),
    ]);
    sendSuccess(res, { reviews, total, page, totalPages: Math.ceil(total / limit) });
  }
);

export const updateQuestionReview = saAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const data = questionReviewSchema.parse(req.body);
    const review = await QuestionReview.findById(req.params.id);
    if (!review) {
      sendError(res, "Question review not found", 404);
      return;
    }
    const before = { status: review.status };
    Object.assign(review, data, {
      reviewedBy: req.user!.userId,
      reviewedAt: new Date(),
    });
    await review.save();
    await createAuditLog({
      user: req.user!.userId,
      userId: req.user!.userId,
      userRole: "national_admin",
      action: "UPDATE_QUESTION_REVIEW",
      resource: "QuestionReview",
      resourceId: review._id.toString(),
      description: `Updated question review status to ${data.status}`,
      before,
      after: { status: review.status },
    }, req);
    sendSuccess(res, { review });
  }
);
