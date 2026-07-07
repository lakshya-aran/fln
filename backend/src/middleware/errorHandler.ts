import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Unhandled error:", err);

  const statusCode = (err as any).statusCode || 500;
  const message = env.NODE_ENV === "production" ? "Internal server error" : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}
