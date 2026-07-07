import mongoose, { Schema, Document } from "mongoose";

export type ScheduleStatus = "scheduled" | "confirmed" | "completed" | "cancelled";

export interface IAssessmentSchedule extends Document {
  block: string;
  district: string;
  state: string;
  school: string;
  schoolId: string;
  subject: "english" | "hindi" | "math" | "regional";
  grade: number;
  scheduledDate: Date;
  session: "morning" | "afternoon" | "full_day";
  volunteerId?: string | null;
  volunteerName?: string | null;
  status: ScheduleStatus;
  locked: boolean;
  scheduledBy: string;
  scheduledById: string;
  notificationSent: boolean;
  notes?: string;
}

const assessmentScheduleSchema = new Schema<IAssessmentSchedule>(
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
    scheduledDate: { type: Date, required: true, index: true },
    session: {
      type: String,
      enum: ["morning", "afternoon", "full_day"],
      default: "morning",
    },
    volunteerId: { type: String, default: null },
    volunteerName: { type: String, default: null },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled"],
      default: "scheduled",
    },
    locked: { type: Boolean, default: true },
    scheduledBy: { type: String, required: true },
    scheduledById: { type: String, required: true },
    notificationSent: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const AssessmentSchedule = mongoose.model<IAssessmentSchedule>(
  "AssessmentSchedule",
  assessmentScheduleSchema
);