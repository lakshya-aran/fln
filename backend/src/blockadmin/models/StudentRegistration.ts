import mongoose, { Schema, Document } from "mongoose";

export type RegistrationType = "dropout" | "new_admission" | "missing_records";
export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface IStudentRegistration extends Document {
  block: string;
  district: string;
  state: string;
  school: string;
  schoolId: string;
  registrationType: RegistrationType;
  status: RegistrationStatus;
  volunteerId: string;
  volunteerName: string;
  studentName: string;
  guardianName: string;
  guardianPhone: string;
  grade: number;
  classSection: string;
  address: string;
  documents: string[];
  verificationStatus: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  approvedBy?: string | null;
  approvedAt?: Date | null;
}

const studentRegistrationSchema = new Schema<IStudentRegistration>(
  {
    block: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    school: { type: String, required: true },
    schoolId: { type: String, required: true, index: true },
    registrationType: {
      type: String,
      enum: ["dropout", "new_admission", "missing_records"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    volunteerId: { type: String, required: true },
    volunteerName: { type: String, required: true },
    studentName: { type: String, required: true },
    guardianName: { type: String, required: true },
    guardianPhone: { type: String, default: "" },
    grade: { type: Number, required: true, min: 1, max: 8 },
    classSection: { type: String, default: "" },
    address: { type: String, default: "" },
    documents: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const StudentRegistration = mongoose.model<IStudentRegistration>(
  "StudentRegistration",
  studentRegistrationSchema
);