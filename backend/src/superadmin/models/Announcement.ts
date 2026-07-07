import mongoose, { Schema, Document } from "mongoose";

export interface ITargetAudience {
  allIndia: boolean;
  states: string[];
  districts: string[];
  blocks: string[];
  schools: string[];
  roles: string[];
}

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  type: "info" | "urgent" | "update";
  status: "draft" | "scheduled" | "published" | "archived";
  targetAudience: ITargetAudience;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  sendEmail: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "urgent", "update"],
      default: "info",
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published", "archived"],
      default: "draft",
    },
    targetAudience: {
      allIndia: { type: Boolean, default: false },
      states: [{ type: String }],
      districts: [{ type: String }],
      blocks: [{ type: String }],
      schools: [{ type: String }],
      roles: [{ type: String }],
    },
    scheduledAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    sendEmail: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>(
  "Announcement",
  announcementSchema
);
