import mongoose, { Schema, Document } from "mongoose";

export type PaperReason = "low_strength" | "no_internet" | "locked_school" | "manual";

export interface IQuestionPaper extends Document {
  block: string;
  district: string;
  state: string;
  school: string;
  schoolId: string;
  subject: "english" | "hindi" | "math" | "regional";
  grade: number;
  language: string;
  version: number;
  reason: PaperReason;
  questionsCount: number;
  paperCode: string;
  generatedBy: string;
  generatedById: string;
  volunteerId?: string | null;
  locked: boolean;
  lockedAt?: Date | null;
  printedAt?: Date | null;
  printedBy?: string | null;
  deliveredAt?: Date | null;
  downloadUrl: string;
}

const questionPaperSchema = new Schema<IQuestionPaper>(
  {
    block: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    school: { type: String, required: true },
    schoolId: { type: String, required: true, index: true },
    subject: {
      type: String,
      enum: ["english", "hindi", "math", "regional"],
      required: true,
    },
    grade: { type: Number, required: true, min: 1, max: 8 },
    language: { type: String, default: "english" },
    version: { type: Number, default: 1 },
    reason: {
      type: String,
      enum: ["low_strength", "no_internet", "locked_school", "manual"],
      default: "manual",
    },
    questionsCount: { type: Number, default: 20 },
    paperCode: { type: String, required: true, unique: true },
    generatedBy: { type: String, required: true },
    generatedById: { type: String, required: true },
    volunteerId: { type: String, default: null },
    locked: { type: Boolean, default: true },
    lockedAt: { type: Date, default: Date.now },
    printedAt: { type: Date, default: null },
    printedBy: { type: String, default: null },
    deliveredAt: { type: Date, default: null },
    downloadUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

questionPaperSchema.index({ block: 1, schoolId: 1, subject: 1, grade: 1 }, { unique: true });

export const QuestionPaper = mongoose.model<IQuestionPaper>(
  "QuestionPaper",
  questionPaperSchema
);