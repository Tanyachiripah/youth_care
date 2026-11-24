import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import { getServerConfig } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { createApp } from "./app.js";
import { initializeRateLimitStore } from "./middleware/mongo-rate-limit-store.js";

async function startServer(): Promise<void> {
  const config = getServerConfig();
  await connectDatabase(config.mongoUri);
  await initializeRateLimitStore();

  const sessionStore = MongoStore.create({
    mongoUrl: config.mongoUri,
    collectionName: "sessions",
    ttl: 60 * 60 * 8,
    autoRemove: "native"
  });
  const app = createApp(config, sessionStore);
  const server = app.listen(config.port);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.once("listening", resolve);
  });
  console.info(JSON.stringify({ event: "server_listening", port: config.port }));

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.info(JSON.stringify({ event: "server_shutdown_started", signal }));
    server.close(async (error) => {
      if (error) process.exitCode = 1;
      try {
        await sessionStore.close();
        await mongoose.disconnect();
      } catch {
        process.exitCode = 1;
        console.error(JSON.stringify({ event: "server_shutdown_failed" }));
      }
    });
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

void startServer().catch(async (error: unknown) => {
  console.error(JSON.stringify({
    event: "server_startup_failed",
    errorName: error instanceof Error ? error.name : "UnknownError"
  }));
  try {
    await mongoose.disconnect();
  } catch {
    process.exitCode = 1;
  }
  process.exitCode = 1;
});
