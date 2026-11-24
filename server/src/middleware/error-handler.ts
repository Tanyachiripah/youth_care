import { ErrorRequestHandler, RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { ApiError } from "./api-error.js";

export const requestId: RequestHandler = (_req, res, next) => {
  res.locals.requestId = randomUUID();
  next();
};

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new ApiError(404, "NOT_FOUND", "The requested API route was not found."));
};

export const apiErrorHandler: ErrorRequestHandler = (error: unknown, req, res, next) => {
  if (res.headersSent) return next(error);

  const err = typeof error === "object" && error !== null
    ? error as { code?: number | string; name?: string; type?: string }
    : {};
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "An unexpected error occurred. Please try again later.";

  if (error instanceof ApiError) {
    status = error.status;
    code = error.code;
    message = error.message;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    code = "INVALID_JSON";
    message = "The request body contains invalid JSON.";
  } else if (err.type === "entity.too.large") {
    status = 413;
    code = "REQUEST_TOO_LARGE";
    message = "The request body is too large.";
  } else if (err.name === "ValidationError" || err.name === "CastError") {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "The request contains invalid data.";
  } else if (err.code === 11000) {
    status = 409;
    code = "CONFLICT";
    message = "A record with those details already exists.";
  } else if (err.name === "MongoNetworkError" || err.name === "MongoServerSelectionError") {
    status = 503;
    code = "SERVICE_UNAVAILABLE";
    message = "A required service is temporarily unavailable.";
  }

  const requestIdValue = String(res.locals.requestId || "unknown");
  if (status >= 500) {
    console.error(JSON.stringify({
      event: "api_error",
      requestId: requestIdValue,
      method: req.method,
      status,
      code,
      errorName: err.name || "Error"
    }));
  }

  res.status(status).json({ error: { code, message, requestId: requestIdValue } });
};