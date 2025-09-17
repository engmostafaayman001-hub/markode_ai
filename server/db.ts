import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema.ts";
import 'dotenv/config';

// تفعيل WebSocket الخاص بـ Neon
neonConfig.webSocketConstructor = ws;

// التأكد من وجود رابط قاعدة البيانات في المتغيرات البيئية
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// إنشاء Pool للاتصال بقاعدة البيانات
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL يكون مفعل تلقائيًا مع Neon
});

// تهيئة Drizzle ORM مع Pool والمخطط (schema)
export const db = drizzle({
  client: pool,
  schema,
});
