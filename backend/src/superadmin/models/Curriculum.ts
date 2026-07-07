import mongoose, { Schema, Document } from "mongoose";

export interface ICurriculumVersion {
  version: number;
  content: string;
  author: string;
  authorId: mongoose.Types.ObjectId;
  notes: string;
  createdAt: Date;
}

export interface ICurriculum extends Document {
  title: string;
  subject: string;
  grade: string;
  language: string;
  currentVersion: number;
  content: string;
  status: "draft" | "published" | "archived";
  learningOutcomes: string[];
  competencies: string[];
  versions: ICurriculumVersion[];
  createdBy: mongoose.Types.ObjectId;
}

const curriculumVersionSchema = new Schema<ICurriculumVersion>(
  {
    version: { type: Number, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const curriculumSchema = new Schema<ICurriculum>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    language: { type: String, required: true },
    currentVersion: { type: Number, default: 1 },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    learningOutcomes: [{ type: String }],
    competencies: [{ type: String }],
    versions: [curriculumVersionSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Curriculum = mongoose.model<ICurriculum>("Curriculum", curriculumSchema);
