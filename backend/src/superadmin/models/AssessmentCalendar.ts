import mongoose, { Schema, Document } from "mongoose";

export interface IAssessmentCalendar extends Document {
  cycle: "baseline" | "mid-year" | "end-of-year";
  academicYear: string;
  label: string;
  description: string;
  startDate: Date;
  endDate: Date;
  resultDate: Date;
  status: "draft" | "published" | "locked" | "archived";
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const assessmentCalendarSchema = new Schema<IAssessmentCalendar>(
  {
    cycle: {
      type: String,
      enum: ["baseline", "mid-year", "end-of-year"],
      required: true,
    },
    academicYear: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    resultDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "locked", "archived"],
      default: "draft",
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const AssessmentCalendar = mongoose.model<IAssessmentCalendar>(
  "AssessmentCalendar",
  assessmentCalendarSchema
);
