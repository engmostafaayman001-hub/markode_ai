import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.ts";
import { setupVite, serveStatic, log } from "./vite.ts";

const app = express();

// Middleware لتحليل JSON و urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware لتسجيل طلبات /api والزمن المستغرق
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // إعادة تعريف res.json لالتقاط الاستجابة
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // تسجيل جميع Routes
  const server = createServer(app);
  await registerRoutes(app, server); // عدل registerRoutes لتقبل server إذا كنت تستخدم WebSocket

  // Middleware للأخطاء
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // إعداد Vite فقط في التطوير بعد تسجيل كل الRoutes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app); // خدمة ملفات الإنتاج
  }

  // إعداد المنفذ والمضيف
  const PORT = Number(process.env.PORT) || 5000;

  // ✅ النسخة الصحيحة لاستماع السيرفر
  server.listen({ port: PORT, host: "0.0.0.0" }, () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
})();
