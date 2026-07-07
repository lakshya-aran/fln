import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  title: string;
  description: string;
  category: "curriculum" | "assessment" | "technical" | "translation" | "infrastructure" | "bug" | "suggestion";
  priority: "low" | "medium" | "high" | "urgent";
  source: "teacher" | "principal" | "volunteer" | "district_officer" | "state_officer";
  sourceUser: {
    name: string;
    email: string;
    role: string;
  };
  status: "open" | "in_progress" | "resolved" | "rejected" | "merged";
  assignedTo: mongoose.Types.ObjectId | null;
  resolvedAt: Date | null;
  resolution: string;
  duplicateOf: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["curriculum", "assessment", "technical", "translation", "infrastructure", "bug", "suggestion"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    source: {
      type: String,
      enum: ["teacher", "principal", "volunteer", "district_officer", "state_officer"],
      required: true,
    },
    sourceUser: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "rejected", "merged"],
      default: "open",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
    resolution: { type: String, default: "" },
    duplicateOf: { type: Schema.Types.ObjectId, ref: "Feedback", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedback>("Feedback", feedbackSchema);
