import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// tsconfig sets `"jsx": "preserve"` (Next.js requirement) — Vite's default
// esbuild transform won't turn that into runnable JSX on its own, so the
// React plugin is what actually makes .tsx test files executable here.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": import.meta.dirname,
    },
  },
  test: {
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/.next/**"],
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
  },
});
