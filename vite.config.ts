import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/__l5e/assets-v1": {
        target:
          "https://id-preview--1aa1b209-5f17-4dd2-aaca-54cdffc202fc.lovable.app",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
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
