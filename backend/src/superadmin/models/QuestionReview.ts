import mongoose, { Schema, Document } from "mongoose";

export interface IQuestionReview extends Document {
  questionId: string;
  questionText: string;
  subject: string;
  grade: string;
  difficulty: "easy" | "medium" | "hard";
  failureRate: number;
  totalAttempts: number;
  correctAttempts: number;
  flagReason: string;
  recommendation: string;
  status: "pending" | "approved" | "edited" | "replaced" | "archived";
  reviewedBy: mongoose.Types.ObjectId | null;
  reviewedAt: Date | null;
  notes: string;
  createdBy: mongoose.Types.ObjectId;
}

const questionReviewSchema = new Schema<IQuestionReview>(
  {
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    failureRate: { type: Number, required: true, min: 0, max: 100 },
    totalAttempts: { type: Number, required: true, min: 0 },
    correctAttempts: { type: Number, required: true, min: 0 },
    flagReason: { type: String, default: "High failure rate on easy question" },
    recommendation: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "edited", "replaced", "archived"],
      default: "pending",
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const QuestionReview = mongoose.model<IQuestionReview>(
  "QuestionReview",
  questionReviewSchema
);
