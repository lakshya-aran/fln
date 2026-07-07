import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../../services/jwt.service";
import { AuthenticatedRequest } from "../../types";
import { sendError } from "../../utils/apiResponse";

export function requireSuperadmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "Access token is required", 401);
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    if (decoded.role !== "national_admin") {
      sendError(res, "Superadmin access required", 403);
      return;
    }
    req.user = decoded;
    next();
  } catch {
    sendError(res, "Invalid or expired access token", 401);
  }
}
