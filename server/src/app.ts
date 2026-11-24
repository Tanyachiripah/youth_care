import { Router } from "express";
import express from "express";
import session, { Store as SessionStore } from "express-session";
import helmet from "helmet";
import cors from "cors";
import { ServerConfig } from "./config/env.js";
import { ApiError } from "./middleware/api-error.js";
import { apiErrorHandler, notFoundHandler, requestId } from "./middleware/error-handler.js";
import { csrfProtection, getCsrfTokenFromRequest } from "./middleware/csrf.js";
import apiRouter from "./routes.js";

export function createApp(
  config: ServerConfig,
  sessionStore: SessionStore,
  router: Router = apiRouter
): express.Express {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.production ? 1 : false);

  app.use(requestId);
  app.use(helmet({ contentSecurityPolicy: config.production ? undefined : false }));
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "private, no-store");
    next();
  });
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, false);
      if (!config.allowedOrigins.has(origin)) {
        return callback(new ApiError(403, "ORIGIN_NOT_ALLOWED", "Request origin is not allowed."));
      }
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
    optionsSuccessStatus: 204
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(session({
    name: "youthcare.sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: config.production,
      path: "/",
      maxAge: 8 * 60 * 60 * 1000
    }
  }));

  app.use("/api", csrfProtection(config.allowedOrigins));
  app.get("/api/csrf-token", (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ csrfToken: getCsrfTokenFromRequest(req) });
  });
  app.use("/api", router);
  app.use("/api", notFoundHandler);
  app.use(apiErrorHandler);

  return app;
}