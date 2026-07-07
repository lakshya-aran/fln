import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  employeeId: string;
  password: string;
  role: string;
  state: string;
  district: string;
  block: string;
  school: string;
  assignedState: string;
  assignedDistrict: string;
  assignedBlocks: string[];
  isActive: boolean;
  lastLogin: Date | null;
  failedLoginAttempts: number;
  lockReason: string;
  lockedAt: Date | null;
  refreshToken: string | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      lowercase: true,
    },
    state: { type: String, default: "", index: true },
    district: { type: String, default: "", index: true },
    block: { type: String, default: "", index: true },
    school: { type: String, default: "" },
    assignedState: { type: String, default: "" },
    assignedDistrict: { type: String, default: "" },
    assignedBlocks: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockReason: { type: String, default: "" },
    lockedAt: { type: Date, default: null },
    refreshToken: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>("User", userSchema);