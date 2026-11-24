import mongoose from "mongoose";

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.set("strictQuery", true);
  mongoose.connection.on("error", (error: unknown) => {
    console.error(JSON.stringify({ event: "mongodb_connection_error", errorName: error instanceof Error ? error.name : "UnknownError" }));
  });
  mongoose.connection.on("disconnected", () => {
    console.error(JSON.stringify({ event: "mongodb_disconnected" }));
  });
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000, connectTimeoutMS: 10_000 });
  console.info(JSON.stringify({ event: "mongodb_connected" }));
}
