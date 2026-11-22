import { requireEnv, serverEnvFilePath } from "./config/env.js";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDatabase } from "./config/db.js";
import apiRouter from "./routes.js";

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = requireEnv("MONGODB_URI");
const sessionSecret = requireEnv("SESSION_SECRET");

if (sessionSecret.length < 32) {
  throw new Error(`SESSION_SECRET must be at least 32 characters. Set it in ${serverEnvFilePath}.`);
}

await connectDatabase(mongoUri);

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false }));
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : (process.env.CLIENT_URL || "http://localhost:5173"),
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(session({
  name: "youthcare.sid",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoUri, collectionName: "sessions", ttl: 60 * 60 * 8 }),
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000
  }
}));

app.use("/api", apiRouter);

if (process.env.NODE_ENV === "production") {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.resolve(here, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

app.listen(port, () => console.log(`YouthCare server listening on ${port}`));
