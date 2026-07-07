import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../../services/jwt.service";
import { User } from "../../models/User";
import { AuthenticatedRequest } from "../../types";
import { sendError } from "../../utils/apiResponse";

export async function requireStateAdmin(
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
    if (decoded.role !== "state_admin") {
      sendError(res, "State admin access required", 403);
      return;
    }
    const user = await User.findById(decoded.userId).select("state assignedState isActive");
    if (!user || !user.isActive) {
      sendError(res, "State admin account not active", 403);
      return;
    }
    const assignedState = user.assignedState || user.state;
    if (!assignedState) {
      sendError(res, "State admin must be assigned to a state", 403);
      return;
    }
    (req.user as any) = { ...decoded, state: user.state, assignedState };
    next();
  } catch {
    sendError(res, "Invalid or expired access token", 401);
  }
}

export function getStateFromRequest(req: AuthenticatedRequest): string {
  return (req.user as any)?.assignedState || (req.user as any)?.state || "";
}