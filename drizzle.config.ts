import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing. Please set it in your .env file.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts", // عدل حسب مكان schema عندك
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    // فرض SSL لتفادي الخطأ
    ssl: {
      rejectUnauthorized: false,
    },
  },
  verbose: true,
  strict: true,
});
