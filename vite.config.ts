import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // مجلد المشروع الخاص بالعميل
  root: path.resolve(__dirname, "client"),
  
  // قاعدة الروابط (ضرورية للبناء على Render)
  base: "./",

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },

  build: {
    // مكان إنتاج الملفات بعد البناء
    outDir: path.resolve(__dirname, "dist/client"),
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
    // منفذ تشغيل Vite dev server
    port: 5173,

    // إعدادات HMR (Hot Module Replacement)
    hmr: {
      host: "127.0.0.1",
      port: 5173,
    },

    // proxy لإعادة توجيه طلبات API إلى backend
    proxy: {
      "/api": "http://localhost:5000",
    },
  },

  define: {
    // لمنع أخطاء process.env و global في الكود العميل
    "process.env": {},
    global: undefined,
  },
});
