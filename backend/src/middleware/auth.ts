import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/jwt.service";
import { sendError } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../types";

export function authenticate(
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
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, "Invalid or expired access token", 401);
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, "Insufficient permissions", 403);
      return;
    }

    next();
  };
}
