import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../../services/jwt.service";
import { User } from "../../models/User";
import { AuthenticatedRequest } from "../../types";
import { sendError } from "../../utils/apiResponse";

export async function requireDistrictAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "Access token is required", 401);
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    if (decoded.role !== "district_officer") {
      sendError(res, "District admin access required", 403);
      return;
    }
    const user = await User.findById(decoded.userId).select("assignedDistrict isActive district name email");
    if (!user || !user.isActive) {
      sendError(res, "District admin account not active", 403);
      return;
    }
    const assignedDistrict = user.assignedDistrict || user.district;
    if (!assignedDistrict) {
      sendError(res, "District admin must be assigned to a district", 403);
      return;
    }
    (req.user as any) = { ...decoded, assignedDistrict, district: assignedDistrict };
    next();
  } catch {
    sendError(res, "Invalid or expired access token", 401);
  }
}

export function getDistrictFromRequest(req: AuthenticatedRequest): string {
  return (req.user as any)?.assignedDistrict || (req.user as any)?.district || "";
}
