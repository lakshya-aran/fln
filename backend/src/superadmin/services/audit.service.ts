import { AuditLog } from "../models/AuditLog";
import { Request } from "express";

interface AuditEntry {
  user: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

export async function createAuditLog(
  entry: AuditEntry,
  req?: Request
): Promise<void> {
  try {
    await AuditLog.create({
      user: entry.user,
      userId: entry.userId,
      userRole: entry.userRole,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId || "",
      description: entry.description || "",
      ip: req?.ip || req?.headers?.["x-forwarded-for"] || "",
      userAgent: req?.headers?.["user-agent"] || "",
      before: entry.before || {},
      after: entry.after || {},
    });
  } catch (error) {
    console.error("Audit log creation failed:", error);
  }
}
