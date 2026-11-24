import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
export const serverEnvFilePath = path.resolve(configDirectory, "../../.env");

dotenv.config({ path: serverEnvFilePath });

export interface ServerConfig {
  nodeEnv: string;
  production: boolean;
  port: number;
  mongoUri: string;
  sessionSecret: string;
  allowedOrigins: ReadonlySet<string>;
  openAiApiKey?: string;
  openAiModel: string;
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is required. Copy server/.env.example to ${serverEnvFilePath}, set the value, or provide it in the process environment.`
    );
  }
  return value;
}

export function getServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const nodeEnv = env.NODE_ENV?.trim();
  if (!nodeEnv) throw new Error("NODE_ENV is required; set development, test, or production explicitly.");
  if (!new Set(["development", "test", "production"]).has(nodeEnv)) {
    throw new Error("NODE_ENV must be development, test, or production.");
  }

  const production = nodeEnv === "production";
  const portValue = env.PORT?.trim() || "5000";
  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port number.");
  }

  const mongoUri = getRequiredEnv(env, "MONGODB_URI");
  if (!/^mongodb(?:\+srv)?:\/\//i.test(mongoUri)) {
    throw new Error("MONGODB_URI must use the mongodb:// or mongodb+srv:// scheme.");
  }
  try {
    const databaseUrl = new URL(mongoUri);
    if (!databaseUrl.hostname || /[<>]/.test(mongoUri)) throw new Error();
  } catch {
    throw new Error("MONGODB_URI must be a valid MongoDB connection URI.");
  }

  const sessionSecret = getRequiredEnv(env, "SESSION_SECRET");
  if (sessionSecret.length < 32 || /^(replace-with|change-me|your-secret|placeholder)/i.test(sessionSecret)) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }

  const clientUrlValue = env.CLIENT_URL?.trim();
  if (production && !clientUrlValue) {
    throw new Error("CLIENT_URL is required in production.");
  }
  const clientUrl = parseOrigin(clientUrlValue || "http://localhost:5173", "CLIENT_URL", production);
  const allowedOrigins = new Set([clientUrl]);

  for (const value of (env.ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean)) {
    allowedOrigins.add(parseOrigin(value, "ALLOWED_ORIGINS", production));
  }

  return {
    nodeEnv,
    production,
    port,
    mongoUri,
    sessionSecret,
    allowedOrigins,
    openAiApiKey: env.OPENAI_API_KEY?.trim() || undefined,
    openAiModel: env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
  };
}

function getRequiredEnv(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function parseOrigin(value: string, name: string, production: boolean): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must contain a valid HTTP or HTTPS origin.`);
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    (production && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${name} must contain a valid ${production ? "HTTPS " : ""}origin only, without credentials, path, query, or fragment.`);
  }
  return url.origin;
}
