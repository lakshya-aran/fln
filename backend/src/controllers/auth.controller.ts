import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { generateTokenPair, verifyRefreshToken } from "../services/jwt.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { ROLE_REDIRECTIONS, JwtPayload } from "../types";
import { env } from "../config/env";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email or Employee ID is required" })
    .min(1, "Email or Employee ID is required"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { employeeId: email }],
  }).select("+password");
  if (!user) {
    sendError(res, "Invalid credentials", 401);
    return;
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    sendError(res, "Invalid credentials", 401);
    return;
  }

  if (!user.isActive) {
    sendError(res, "Account is inactive. Contact your administrator.", 403);
    return;
  }

  const payload: JwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const { accessToken, refreshToken } = generateTokenPair(payload);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  const redirectPath = ROLE_REDIRECTIONS[user.role] || "/dashboard";

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    },
    redirectPath,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.cookies || req.body;

  if (!token) {
    sendError(res, "Refresh token is required", 401);
    return;
  }

  let decoded: JwtPayload;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    sendError(res, "Invalid or expired refresh token", 401);
    return;
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive || user.refreshToken !== token) {
    sendError(res, "Invalid refresh token", 401);
    return;
  }

  const payload: JwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const tokens = generateTokenPair(payload);

  user.refreshToken = tokens.refreshToken;
  await user.save();

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.cookies || req.body;

  if (token) {
    const decoded = verifyRefreshToken(token);
    if (decoded?.userId) {
      await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
  });

  sendSuccess(res, { message: "Logged out successfully" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  if (!userId) {
    sendError(res, "Authentication required", 401);
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    sendError(res, "User not found", 404);
    return;
  }

  sendSuccess(res, {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    },
  });
});
