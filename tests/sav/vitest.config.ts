import { defineConfig } from "vitest/config";

export default defineConfig({
 test: {
   root: import.meta.dirname,
   environment: "node",
   include: ["workflow.test.ts"],
   testTimeout: 20_000,
   hookTimeout: 30_000,
   fileParallelism: false,
 },
});
