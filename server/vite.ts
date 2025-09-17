import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

// إعداد __dirname و __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logger عام
const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// إعداد Vite في وضع التطوير (middleware)
export async function setupVite(app: Express, server: any) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    root: path.resolve(__dirname, ".."), // جذر المشروع
    configFile: path.resolve(__dirname, "../vite.config.js"),
    server: serverOptions,
    appType: "custom",
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1); // أي خطأ في Vite يوقف السيرفر
      },
    },
  });

  app.use(vite.middlewares);

  // fallback لجميع الطلبات
  app.use("*", async (req, res, next) => {
    try {
      const templatePath = path.resolve(__dirname, "..", "client", "index.html");
      let template: string;

      try {
        template = await fs.promises.readFile(templatePath, "utf-8");
      } catch (err) {
        return next(new Error(`❌ Could not read index.html: ${err}`));
      }

      // إضافة نسخة عشوائية لمنع caching أثناء التطوير
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// خدمة الملفات الثابتة بعد build
export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../dist/client");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `❌ Could not find the build directory: ${distPath}. Run "npm run build" first.`
    );
  }

  app.use(express.static(distPath));

  // fallback لجميع الطلبات
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
