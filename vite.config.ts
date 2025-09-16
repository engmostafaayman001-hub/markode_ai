// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Helper to conditionally import Replit plugins in dev
const replitPlugins = async () => {
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const cartographer = (await import("@replit/vite-plugin-cartographer")).cartographer();
    const devBanner = (await import("@replit/vite-plugin-dev-banner")).devBanner();
    return [cartographer, devBanner];
  }
  return [];
};

export default defineConfig(async () => ({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(await replitPlugins()),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  base: "./", // مهم لتجنب مشاكل المسارات في السيرفر
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000, // رفع حد التحذير إلى 2 ميجابايت
    rollupOptions: {
      input: path.resolve(__dirname, "client/index.html"), // HTML الأساسي
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            return "vendor"; // فصل كل المكتبات الخارجية في chunk واحد
          }
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
}));
