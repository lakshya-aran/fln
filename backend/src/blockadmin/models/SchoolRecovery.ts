import mongoose, { Schema, Document } from "mongoose";

export type RecoveryAction =
  | "viewed_lock_reason"
  | "temporary_access"
  | "reset_login"
  | "unlocked"
  | "continued_assessment";

export interface ISchoolRecovery extends Document {
  block: string;
  district: string;
  state: string;
  school: string;
  schoolId: string;
  principalEmail: string;
  action: RecoveryAction;
  reason: string;
  performedBy: string;
  performedById: string;
  performedByRole: string;
  ip: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

const schoolRecoverySchema = new Schema<ISchoolRecovery>(
  {
    block: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    school: { type: String, required: true },
    schoolId: { type: String, required: true, index: true },
    principalEmail: { type: String, required: true },
    action: {
      type: String,
      enum: ["viewed_lock_reason", "temporary_access", "reset_login", "unlocked", "continued_assessment"],
      required: true,
    },
    reason: { type: String, default: "" },
    performedBy: { type: String, required: true },
    performedById: { type: String, required: true },
    performedByRole: { type: String, required: true },
    ip: { type: String, default: "" },
    before: { type: Schema.Types.Mixed, default: {} },
    after: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const SchoolRecovery = mongoose.model<ISchoolRecovery>(
  "SchoolRecovery",
  schoolRecoverySchema
);