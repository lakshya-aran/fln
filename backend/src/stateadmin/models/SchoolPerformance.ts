import mongoose, { Schema, Document } from "mongoose";

export type PipelineStage = "assessment_conducted" | "uploaded" | "scanning" | "evaluation" | "outcomes" | "certified";

export interface ISchoolPerformance extends Document {
  state: string;
  district: string;
  block: string;
  school: string;
  schoolId: string;
  totalStudents: number;
  totalTeachers: number;
  totalVolunteers: number;
  assessmentCompletion: number;
  flnCertification: number;
  readingScore: number;
  mathScore: number;
  completionStatus: "complete" | "in_progress" | "pending" | "locked";
  infrastructureRequests: number;
  pipelineStage: PipelineStage | null;
  pipelineEnteredAt: Date | null;
  lastUpdated: Date;
}

const schoolPerformanceSchema = new Schema<ISchoolPerformance>(
  {
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    block: { type: String, default: "" },
    school: { type: String, required: true },
    schoolId: { type: String, required: true, index: true },
    totalStudents: { type: Number, default: 0 },
    totalTeachers: { type: Number, default: 0 },
    totalVolunteers: { type: Number, default: 0 },
    assessmentCompletion: { type: Number, default: 0, min: 0, max: 100 },
    flnCertification: { type: Number, default: 0, min: 0, max: 100 },
    readingScore: { type: Number, default: 0, min: 0, max: 100 },
    mathScore: { type: Number, default: 0, min: 0, max: 100 },
    completionStatus: {
      type: String,
      enum: ["complete", "in_progress", "pending", "locked"],
      default: "pending",
    },
    infrastructureRequests: { type: Number, default: 0 },
    pipelineStage: {
      type: String,
      enum: ["assessment_conducted", "uploaded", "scanning", "evaluation", "outcomes", "certified", null],
      default: null,
    },
    pipelineEnteredAt: { type: Date, default: null },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

schoolPerformanceSchema.virtual("daysInCurrentStage").get(function () {
  if (!this.pipelineEnteredAt) return 0;
  return Math.floor((Date.now() - this.pipelineEnteredAt.getTime()) / (1000 * 60 * 60 * 24));
});

schoolPerformanceSchema.set("toJSON", { virtuals: true });
schoolPerformanceSchema.set("toObject", { virtuals: true });

export const SchoolPerformance = mongoose.model<ISchoolPerformance>(
  "SchoolPerformance",
  schoolPerformanceSchema
);