import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  user: string;
  userId: mongoose.Types.ObjectId;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  description: string;
  ip: string;
  userAgent: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String, default: "" },
    description: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    before: { type: Schema.Types.Mixed, default: {} },
    after: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
