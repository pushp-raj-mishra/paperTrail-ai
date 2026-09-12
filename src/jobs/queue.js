import { Queue } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6380", 10),
  maxRetriesPerRequest: null,
});

export const ingestionQueue = new Queue("document-ingestion", { connection });

console.log("BullMQ Ingestion Queue initialized");
