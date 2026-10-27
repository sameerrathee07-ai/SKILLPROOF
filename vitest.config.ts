import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    pool: "vmThreads",
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json-summary", "lcov"],
      include: [
        "app/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.{test,spec}.{ts,tsx}",
        "**/node_modules/**",
        "**/*.d.ts",
        "lib/generated/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "."),
    },
  },
});