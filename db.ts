import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // قراءة متغيرات البيئة من .env

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

// اختبار الاتصال
pool.connect()
  .then(client => {
    console.log("✅ Database connected successfully!");
    client.release();
  })
  .catch(err => {
    console.error("❌ Database connection error:", err);
  });
