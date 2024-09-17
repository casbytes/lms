import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

installGlobals();

const MODE = process.env.NODE_ENV;

export default defineConfig({
  build: {
    cssMinify: MODE === "production",
    rollupOptions: {
      external: [/node:.*/, "stream", "crypto", "fsevents"],
    },
  },
  server: {
    watch: {
      ignored: ["**/playwright-report/**"],
    },
  },
  plugins: [
    process.env.NODE_ENV === "test"
      ? null
      : remix({
          ignoredRouteFiles: ["**/*.css"],
        }),
    tsconfigPaths(),
  ],
  test: {
    include: ["**/__tests__/**.{js,jsx,ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./tests/setup/setup-tests-env.ts"],
    restoreMocks: true,
    coverage: {
      exclude: ["**/__tests__/**"],
      include: ["app/**/*.{ts,tsx}"],
      all: true,
    },
    alias: {
      "~": "/app",
    },
  },
});
