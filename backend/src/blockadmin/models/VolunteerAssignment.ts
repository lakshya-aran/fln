import mongoose, { Schema, Document } from "mongoose";

export type VolunteerStatus =
  | "offline"
  | "available"
  | "assignment_offered"
  | "assignment_accepted"
  | "slot_locked"
  | "on_duty"
  | "completed";

export type AssignmentStage =
  | "available"
  | "schools_listed"
  | "accepted"
  | "locked"
  | "principal_notified"
  | "visit"
  | "uploaded"
  | "completed";

export interface IVolunteerAssignment extends Document {
  block: string;
  district: string;
  state: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  school: string;
  schoolId: string;
  assignmentStage: AssignmentStage;
  status: VolunteerStatus;
  reliabilityScore: number;
  availability: string;
  assignedAt: Date;
  acceptedAt?: Date | null;
  completedAt?: Date | null;
  replacedBy?: string | null;
  emergencyReplacement: boolean;
  notes?: string;
}

const volunteerAssignmentSchema = new Schema<IVolunteerAssignment>(
  {
    block: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    volunteerId: { type: String, required: true, index: true },
    volunteerName: { type: String, required: true },
    volunteerEmail: { type: String, required: true },
    school: { type: String, required: true },
    schoolId: { type: String, required: true, index: true },
    assignmentStage: {
      type: String,
      enum: ["available", "schools_listed", "accepted", "locked", "principal_notified", "visit", "uploaded", "completed"],
      default: "available",
    },
    status: {
      type: String,
      enum: ["offline", "available", "assignment_offered", "assignment_accepted", "slot_locked", "on_duty", "completed"],
      default: "available",
    },
    reliabilityScore: { type: Number, default: 80, min: 0, max: 100 },
    availability: { type: String, default: "weekday" },
    assignedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    replacedBy: { type: String, default: null },
    emergencyReplacement: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const VolunteerAssignment = mongoose.model<IVolunteerAssignment>(
  "VolunteerAssignment",
  volunteerAssignmentSchema
);