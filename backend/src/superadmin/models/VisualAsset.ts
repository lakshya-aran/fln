import mongoose, { Schema, Document } from "mongoose";

export interface IVisualAssetVersion {
  version: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface IVisualAsset extends Document {
  title: string;
  description: string;
  url: string;
  type: "image" | "illustration" | "icon";
  tags: {
    subjects: string[];
    grades: string[];
    languages: string[];
  };
  currentVersion: number;
  versions: IVisualAssetVersion[];
  fileSize: number;
  mimeType: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const visualAssetVersionSchema = new Schema<IVisualAssetVersion>(
  {
    version: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: String, required: true },
  },
  { _id: false }
);

const visualAssetSchema = new Schema<IVisualAsset>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "illustration", "icon"],
      required: true,
    },
    tags: {
      subjects: [{ type: String }],
      grades: [{ type: String }],
      languages: [{ type: String }],
    },
    currentVersion: { type: Number, default: 1 },
    versions: [visualAssetVersionSchema],
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const VisualAsset = mongoose.model<IVisualAsset>(
  "VisualAsset",
  visualAssetSchema
);
