import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema.js";
import dotenv from "dotenv";

dotenv.config();

// i am creaating connection pool and initializing drizzle with schema
const queryClient = postgres(process.env.DATABASE_URL, {
  prepare: false,
  ssl: "require",
});

export const db = drizzle(queryClient, { schema });

queryClient`SELECT 1`
  .then(() => {
    console.log("DATABASE CONNECTED SUCCESSFULLY!");
  })
  .catch((err) => {
    console.error("CRITICAL DATABASE ERROR:");
    console.error(err);
  });
