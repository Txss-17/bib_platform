import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const moduleId = id.replace(/\\/g, "/");

          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(moduleId)) {
            return "react-vendor";
          }

          if (/\/node_modules\/@supabase\//.test(moduleId)) {
            return "supabase-vendor";
          }

          if (/\/node_modules\/@tanstack\//.test(moduleId)) {
            return "query-vendor";
          }

          if (/\/node_modules\/@radix-ui\//.test(moduleId)) {
            return "radix-vendor";
          }
        },
      },
    },
  },
  resolve: {
    extensions: [".mjs", ".ts", ".tsx", ".mts", ".js", ".jsx", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
