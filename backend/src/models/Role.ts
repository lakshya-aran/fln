import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Role = mongoose.model<IRole>("Role", roleSchema);
