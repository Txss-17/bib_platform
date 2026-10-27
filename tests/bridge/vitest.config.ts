import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
export default defineConfig({
  test: {
    root: import.meta.dirname,
    environment: "node",
    include: ["*.test.ts"],
    testTimeout: 20_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
  resolve: {
    alias: [
      {
        find: "npm:@supabase/supabase-js@2/cors",
        replacement: resolve(import.meta.dirname, "cors.ts"),
      },
      {
        find: "npm:@supabase/supabase-js@2",
        replacement: resolve(
          import.meta.dirname,
          "../../node_modules/@supabase/supabase-js/dist/index.mjs",
        ),
      },
      {
        find: "npm:zod@3",
        replacement: resolve(
          import.meta.dirname,
          "../../node_modules/zod/index.js",
        ),
      },
    ],
  },
});
