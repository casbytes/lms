/// <reference types="vitest" />
import { vitePlugin as remix } from "@remix-run/dev";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  server: {
    port:
      process.env.NODE_ENV === "production" ? Number(process.env.PORT!) : 3000,
  },
  plugins: [
    remix({}),
    tsconfigPaths(),
    sentryVitePlugin({
      org: "christopher-a-sesugh",
      project: "casbytes",
    }),
  ],
  build: {
    sourcemap: true,
  },
  test: {
    globals: true,
    reporters: ["default", "html"],
    environment: "jsdom",
    setupFiles: ["./test/setup-tests.ts"],
    include: ["./app/**/*.{test}.{js,ts,jsx,tsx}"],
    watchExclude: [
      ".*\\/node_modules\\/.*",
      ".*\\/.github\\/.*",
      ".*\\/build\\/.*",
      ".*\\/prisma\\/.*",
      ".*\\/.git\\/.*",
      ".*\\/public\\/.*",
      ".*\\/playwright\\/.*",
      ".*\\/e2e\\/.*",
      ".*\\/content\\/.*",
      ".*\\/meta\\/.*",
    ],
  },
});
