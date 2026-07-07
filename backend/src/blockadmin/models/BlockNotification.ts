import mongoose, { Schema, Document } from "mongoose";

export type BlockNotificationType = "reminder" | "assessment" | "printing_ready" | "assignment" | "emergency" | "milestone" | "system";
export type TargetRole = "schools" | "teachers" | "volunteers" | "principals" | "all";

export interface IBlockNotification extends Document {
  block: string;
  district: string;
  state: string;
  type: BlockNotificationType;
  targetRole: TargetRole;
  targetSchoolId?: string | null;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  read: boolean;
  readBy: string[];
  metadata?: Record<string, unknown>;
}

const blockNotificationSchema = new Schema<IBlockNotification>(
  {
    block: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["reminder", "assessment", "printing_ready", "assignment", "emergency", "milestone", "system"],
      required: true,
    },
    targetRole: {
      type: String,
      enum: ["schools", "teachers", "volunteers", "principals", "all"],
      default: "all",
    },
    targetSchoolId: { type: String, default: null },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },
    read: { type: Boolean, default: false },
    readBy: [{ type: String }],
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const BlockNotification = mongoose.model<IBlockNotification>(
  "BlockNotification",
  blockNotificationSchema
);