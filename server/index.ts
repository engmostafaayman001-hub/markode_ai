import express, { type Request, Response, NextFunction, type Express } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes.js"; // بعد build يجب أن يكون .js
import { setupVite, serveStatic, log } from "./vite.js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// إعداد __dirname و __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// قراءة package.json بشكل آمن
let pkgJson: Record<string, any> = {};
const pkgPathDev = resolve(__dirname, "../package.json"); // أثناء التطوير
const pkgPathDist = resolve(__dirname, "../../package.json"); // بعد build في dist/server.js

if (existsSync(pkgPathDev)) {
  pkgJson = JSON.parse(readFileSync(pkgPathDev, "utf-8"));
} else if (existsSync(pkgPathDist)) {
  pkgJson = JSON.parse(readFileSync(pkgPathDist, "utf-8"));
} else {
  console.warn("⚠️ package.json غير موجود، سيتم استخدام نسخة فارغة");
}

// إنشاء تطبيق Express
const app: Express = express();

// Middleware لتحليل JSON و urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware لتسجيل طلبات /api والزمن المستغرق
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server: Server = createServer(app);

  // تسجيل جميع Routes
  await registerRoutes(app, server);

  // Middleware للأخطاء
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  // وضع التطوير أو الإنتاج
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app); // يخدم dist/client
  }

  // إعداد المنفذ
  const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📦 Version: ${pkgJson.version || "unknown"}`);
});

})();
