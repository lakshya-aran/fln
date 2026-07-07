import mongoose, { Schema, Document } from "mongoose";

export interface IPrintRequest extends Document {
  block: string;
  district: string;
  state: string;
  school: string;
  schoolId: string;
  paperCode: string;
  copies: number;
  reason: string;
  status: "pending" | "in_progress" | "ready" | "delivered" | "collected";
  requestedBy: string;
  requestedById: string;
  volunteerId?: string | null;
  notes?: string;
}

const printRequestSchema = new Schema<IPrintRequest>(
  {
    block: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    school: { type: String, required: true },
    schoolId: { type: String, required: true, index: true },
    paperCode: { type: String, required: true },
    copies: { type: Number, default: 30 },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in_progress", "ready", "delivered", "collected"],
      default: "pending",
    },
    requestedBy: { type: String, required: true },
    requestedById: { type: String, required: true },
    volunteerId: { type: String, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const PrintRequest = mongoose.model<IPrintRequest>(
  "PrintRequest",
  printRequestSchema
);