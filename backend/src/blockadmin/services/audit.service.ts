import { Request } from "express";
import { AuditLog } from "../../superadmin/models/AuditLog";

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
  block?: string;
  district?: string;
}

export async function createBlockAuditLog(
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
      ip: req?.ip || (req?.headers?.["x-forwarded-for"] as string) || "",
      userAgent: req?.headers?.["user-agent"] || "",
      before: entry.before || {},
      after: entry.after || {},
      metadata: {
        block: entry.block || "",
        district: entry.district || "",
        module: "block-admin",
      },
    });
  } catch (error) {
    console.error("Block audit log creation failed:", error);
  }
}