import { randomBytes, timingSafeEqual } from "node:crypto";
import { Request, RequestHandler } from "express";
import { ApiError } from "./api-error.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function verifyCsrfToken(expected: string | undefined, provided: string | undefined): boolean {
  if (!expected || !provided) return false;
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
}

export function hasTrustedOrigin(origin: string | undefined, allowedOrigins: ReadonlySet<string>): boolean {
  return origin !== undefined && allowedOrigins.has(origin);
}

export function csrfProtection(allowedOrigins: ReadonlySet<string>): RequestHandler {
  return (req, _res, next) => {
    if (safeMethods.has(req.method)) return next();
    if (!hasTrustedOrigin(req.get("origin"), allowedOrigins)) {
      return next(new ApiError(403, "ORIGIN_NOT_ALLOWED", "Request origin is not allowed."));
    }
    if (!verifyCsrfToken(req.session.csrfToken, req.get("x-csrf-token"))) {
      return next(new ApiError(403, "CSRF_TOKEN_INVALID", "A valid CSRF token is required."));
    }
    next();
  };
}

export function getCsrfTokenFromRequest(req: Request): string {
  if (!req.session.csrfToken) req.session.csrfToken = createCsrfToken();
  return req.session.csrfToken;
}