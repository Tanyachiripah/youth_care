import { Request, Response } from "express";
import { rateLimit, Store } from "express-rate-limit";
import { MongoRateLimitStore } from "./mongo-rate-limit-store.js";

export function createRateLimiter(
  namespace: string,
  limit: number,
  windowMs: number,
  hashSecret: string,
  store: Store = new MongoRateLimitStore(namespace, hashSecret)
) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    handler: (req, res, _next, options) => {
      const resetTime = (req as Request & { rateLimit?: { resetTime?: Date } }).rateLimit?.resetTime;
      if (resetTime) {
        res.setHeader("Retry-After", String(Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))));
      }
      res.status(options.statusCode).json({
        error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." }
      });
    }
  });
}