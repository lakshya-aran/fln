import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../../services/jwt.service";
import { User } from "../../models/User";
import { AuthenticatedRequest } from "../../types";
import { sendError } from "../../utils/apiResponse";

export async function requireBlockAdmin(
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
    if (decoded.role !== "block_officer") {
      sendError(res, "Block admin access required", 403);
      return;
    }
    const user = await User.findById(decoded.userId).select(
      "assignedBlocks block assignedState assignedDistrict state district name email isActive"
    );
    if (!user || !user.isActive) {
      sendError(res, "Block admin account not active", 403);
      return;
    }
    const blocks = user.assignedBlocks && user.assignedBlocks.length > 0
      ? user.assignedBlocks
      : user.block
        ? [user.block]
        : [];
    if (blocks.length === 0) {
      sendError(res, "Block admin must be assigned to a block", 403);
      return;
    }
    (req.user as any) = {
      ...decoded,
      blocks,
      block: blocks[0],
      assignedState: user.assignedState || user.state || "Maharashtra",
      assignedDistrict: user.assignedDistrict || user.district || "Pune",
      state: user.state || "Maharashtra",
      district: user.district || "Pune",
      name: user.name,
      email: user.email,
      userId: String(user._id),
    };
    next();
  } catch {
    sendError(res, "Invalid or expired access token", 401);
  }
}

export function getBlocksFromRequest(req: AuthenticatedRequest): string[] {
  const u = req.user as any;
  if (!u) return [];
  return u.blocks || (u.block ? [u.block] : []);
}

export function getBlockFilter(req: AuthenticatedRequest): { block: { $in: string[] } } {
  const blocks = getBlocksFromRequest(req);
  return { block: { $in: blocks } };
}