import { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    ...data,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
): void {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}
