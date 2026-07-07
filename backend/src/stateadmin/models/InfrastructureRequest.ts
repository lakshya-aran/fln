import mongoose, { Schema, Document } from "mongoose";

export type InfrastructureCategory =
  | "electricity"
  | "internet"
  | "devices"
  | "furniture"
  | "building"
  | "washroom"
  | "drinking_water"
  | "other";

export type InfrastructureStatus =
  | "pending"
  | "approved"
  | "in_progress"
  | "resolved"
  | "rejected";

export interface IInfrastructureRequest extends Document {
  title: string;
  description: string;
  category: InfrastructureCategory;
  priority: "low" | "medium" | "high" | "urgent";
  state: string;
  district: string;
  block: string;
  school: string;
  reportedBy: string;
  reportedByEmail: string;
  status: InfrastructureStatus;
  resolution: string;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const infrastructureRequestSchema = new Schema<IInfrastructureRequest>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: [
        "electricity",
        "internet",
        "devices",
        "furniture",
        "building",
        "washroom",
        "drinking_water",
        "other",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    block: { type: String, default: "", index: true },
    school: { type: String, default: "" },
    reportedBy: { type: String, required: true },
    reportedByEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "in_progress", "resolved", "rejected"],
      default: "pending",
    },
    resolution: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const InfrastructureRequest = mongoose.model<IInfrastructureRequest>(
  "InfrastructureRequest",
  infrastructureRequestSchema
);