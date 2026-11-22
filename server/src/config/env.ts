import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
export const serverEnvFilePath = path.resolve(configDirectory, "../../.env");

dotenv.config({ path: serverEnvFilePath });

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is required. Copy server/.env.example to ${serverEnvFilePath}, set the value, or provide it in the process environment.`
    );
  }
  return value;
}
