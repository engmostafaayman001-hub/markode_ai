import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: path.resolve(__dirname, "client"), // مجلد العميل
  base: "./", // مهم عشان التحزيم يشتغل بشكل صحيح في Render
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/client"), // مجلد إنتاج الواجهة
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "client/index.html"),
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy:
      process.env.NODE_ENV === "development"
        ? {
            "/api": {
              target: "http://localhost:5000",
              changeOrigin: true,
              secure: false,
            },
            "/ws": {
              target: "ws://localhost:5000",
              ws: true,
            },
          }
        : undefined,
  },
});
