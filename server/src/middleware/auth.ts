import { Request, Response, NextFunction } from "express";
import { ApiError } from "./api-error.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return next(new ApiError(401, "AUTHENTICATION_REQUIRED", "Authentication required."));
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return next(new ApiError(401, "AUTHENTICATION_REQUIRED", "Authentication required."));
  if (req.session.role !== "admin") return next(new ApiError(403, "ADMIN_ACCESS_REQUIRED", "Administrator access required."));
  next();
}
