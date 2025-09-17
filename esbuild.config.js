import { build } from "esbuild";

// قائمة الـ core modules والباكيجات التي يجب استثناؤها أثناء الباندل
const nodeBuiltIns = [
  "assert", "buffer", "child_process", "cluster", "console", "constants",
  "crypto", "dgram", "dns", "domain", "events", "fs", "http", "http2", "https",
  "inspector", "module", "net", "os", "path", "perf_hooks", "process", "punycode",
  "querystring", "readline", "repl", "stream", "string_decoder", "sys", "timers",
  "tls", "tty", "url", "util", "v8", "vm", "zlib"
];

// الباكيجات التي تستخدم Node APIs داخليًا ويجب استثناؤها
const externalPackages = [
  "express",
  "express-session",
  "ws",
  "dotenv",
  "drizzle-orm",
  "drizzle-orm/neon-serverless",
  "drizzle-zod",
  "openai",
  "connect-pg-simple",
  "vite",
  "rollup"
];

build({
  entryPoints: ["server/index.ts"], // الملف الرئيسي للسيرفر
  bundle: true,                     // دمج كل الملفات في ملف واحد
  platform: "node",                 // لأنه Node.js server
  format: "esm",                    // ESM لدعم import/export
  outfile: "dist/server.js",        // مكان الملف الناتج
  external: [...nodeBuiltIns, ...externalPackages], // استثناء كل ما سبق
  sourcemap: true,                  // لتسهيل تتبع الأخطاء
  logLevel: "info",                 // طباعة معلومات البناء
}).catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});
