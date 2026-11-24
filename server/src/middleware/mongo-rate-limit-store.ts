import { createHmac } from "node:crypto";
import mongoose from "mongoose";
import { IncrementResponse, Options, Store } from "express-rate-limit";

interface RateLimitCounter {
  _id: string;
  count: number;
  resetAt: Date;
}

const collectionName = "rate_limits";

export async function initializeRateLimitStore(): Promise<void> {
  const database = mongoose.connection.db;
  if (!database) throw new Error("MongoDB must be connected before initializing rate limits.");
  await database.collection<RateLimitCounter>(collectionName).createIndex(
    { resetAt: 1 },
    { expireAfterSeconds: 0, name: "rate_limit_expiry" }
  );
}

export class MongoRateLimitStore implements Store {
  readonly prefix: string;
  readonly localKeys = false;
  private windowMs = 60_000;

  constructor(private readonly namespace: string, private readonly hashSecret: string) {
    this.prefix = namespace;
  }

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  async increment(key: string): Promise<IncrementResponse> {
    const now = new Date();
    const nextReset = new Date(now.getTime() + this.windowMs);
    const id = this.getId(key);
    const collection = this.getCollection();

    await collection.updateOne(
      { _id: id },
      [
        {
          $set: {
            count: {
              $cond: [
                { $gt: ["$resetAt", now] },
                { $add: [{ $ifNull: ["$count", 0] }, 1] },
                1
              ]
            },
            resetAt: { $cond: [{ $gt: ["$resetAt", now] }, "$resetAt", nextReset] }
          }
        }
      ],
      { upsert: true }
    );

    const counter = await collection.findOne({ _id: id });
    if (!counter) throw new Error("Rate limit counter was not persisted.");
    return { totalHits: counter.count, resetTime: counter.resetAt };
  }

  async get(key: string): Promise<{ totalHits: number; resetTime: Date } | undefined> {
    const counter = await this.getCollection().findOne({ _id: this.getId(key) });
    if (!counter || counter.resetAt <= new Date()) return undefined;
    return { totalHits: counter.count, resetTime: counter.resetAt };
  }

  async decrement(key: string): Promise<void> {
    await this.getCollection().updateOne(
      { _id: this.getId(key), count: { $gt: 0 } },
      { $inc: { count: -1 } }
    );
  }

  async resetKey(key: string): Promise<void> {
    await this.getCollection().deleteOne({ _id: this.getId(key) });
  }

  async resetAll(): Promise<void> {
    await this.getCollection().deleteMany({ _id: { $regex: `^${escapeRegex(this.namespace)}:` } });
  }

  private getId(key: string): string {
    const digest = createHmac("sha256", this.hashSecret).update(key).digest("hex");
    return `${this.namespace}:${digest}`;
  }

  private getCollection() {
    const database = mongoose.connection.db;
    if (!database) throw new Error("MongoDB is not connected.");
    return database.collection<RateLimitCounter>(collectionName);
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}