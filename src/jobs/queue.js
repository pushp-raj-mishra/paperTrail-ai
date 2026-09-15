import { Queue } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6380", 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls:
    process.env.REDIS_HOST && process.env.REDIS_HOST.includes("upstash")
      ? {}
      : undefined,
});

export const ingestionQueue = new Queue("document-ingestion", { connection });

console.log("BullMQ Ingestion Queue initialized");
