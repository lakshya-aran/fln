import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  district: string;
  block?: string;
  type: "bottleneck" | "milestone" | "report_ready" | "system";
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  read: boolean;
  metadata?: Record<string, unknown>;
}

const notificationSchema = new Schema<INotification>(
  {
    district: { type: String, required: true, index: true },
    block: { type: String, default: "", index: true },
    type: {
      type: String,
      enum: ["bottleneck", "milestone", "report_ready", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
