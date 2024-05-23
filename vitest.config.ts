/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";

export default defineConfig({
  plugins: [remix()],
  test: {
    include: ["**/__tests__/**.{js,jsx,ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./test/setup-tests.ts"],
  },
});
