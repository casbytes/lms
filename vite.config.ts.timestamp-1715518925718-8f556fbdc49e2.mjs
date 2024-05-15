// vite.config.ts
import { vitePlugin as remix } from "file:///Users/codingsimba/Desktop/projects/client/node_modules/@remix-run/dev/dist/index.js";
import { sentryVitePlugin } from "file:///Users/codingsimba/Desktop/projects/client/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import { installGlobals } from "file:///Users/codingsimba/Desktop/projects/client/node_modules/@remix-run/node/dist/index.js";
import { defineConfig } from "file:///Users/codingsimba/Desktop/projects/client/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///Users/codingsimba/Desktop/projects/client/node_modules/vite-tsconfig-paths/dist/index.mjs";
installGlobals();
var vite_config_default = defineConfig({
  server: {
    port: process.env.NODE_ENV === "production" ? Number(process.env.PORT) : 3e3
  },
  plugins: [
    remix({}),
    tsconfigPaths(),
    sentryVitePlugin({
      org: "christopher-a-sesugh",
      project: "casbytes"
    })
  ],
  build: {
    sourcemap: true
  },
  test: {
    globals: true,
    reporters: ["default", "html"],
    environment: "jsdom",
    setupFiles: ["./test/setup-tests.ts"],
    testMatch: ["./app/**/*.{test}.{js,ts,jsx,tsx}"],
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
      ".*\\/meta\\/.*"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvY29kaW5nc2ltYmEvRGVza3RvcC9wcm9qZWN0cy9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9jb2RpbmdzaW1iYS9EZXNrdG9wL3Byb2plY3RzL2NsaWVudC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvY29kaW5nc2ltYmEvRGVza3RvcC9wcm9qZWN0cy9jbGllbnQvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSBcIkByZW1peC1ydW4vZGV2XCI7XG5pbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSBcIkBzZW50cnkvdml0ZS1wbHVnaW5cIjtcbmltcG9ydCB7IGluc3RhbGxHbG9iYWxzIH0gZnJvbSBcIkByZW1peC1ydW4vbm9kZVwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XG5cbmluc3RhbGxHbG9iYWxzKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBOdW1iZXIocHJvY2Vzcy5lbnYuUE9SVCEpIDogMzAwMCxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlbWl4KHt9KSxcbiAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgc2VudHJ5Vml0ZVBsdWdpbih7XG4gICAgICBvcmc6IFwiY2hyaXN0b3BoZXItYS1zZXN1Z2hcIixcbiAgICAgIHByb2plY3Q6IFwiY2FzYnl0ZXNcIixcbiAgICB9KSxcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIHJlcG9ydGVyczogW1wiZGVmYXVsdFwiLCBcImh0bWxcIl0sXG4gICAgZW52aXJvbm1lbnQ6IFwianNkb21cIixcbiAgICBzZXR1cEZpbGVzOiBbXCIuL3Rlc3Qvc2V0dXAtdGVzdHMudHNcIl0sXG4gICAgdGVzdE1hdGNoOiBbXCIuL2FwcC8qKi8qLnt0ZXN0fS57anMsdHMsanN4LHRzeH1cIl0sXG4gICAgd2F0Y2hFeGNsdWRlOiBbXG4gICAgICBcIi4qXFxcXC9ub2RlX21vZHVsZXNcXFxcLy4qXCIsXG4gICAgICBcIi4qXFxcXC8uZ2l0aHViXFxcXC8uKlwiLFxuICAgICAgXCIuKlxcXFwvYnVpbGRcXFxcLy4qXCIsXG4gICAgICBcIi4qXFxcXC9wcmlzbWFcXFxcLy4qXCIsXG4gICAgICBcIi4qXFxcXC8uZ2l0XFxcXC8uKlwiLFxuICAgICAgXCIuKlxcXFwvcHVibGljXFxcXC8uKlwiLFxuICAgICAgXCIuKlxcXFwvcGxheXdyaWdodFxcXFwvLipcIixcbiAgICAgIFwiLipcXFxcL2UyZVxcXFwvLipcIixcbiAgICAgIFwiLipcXFxcL2NvbnRlbnRcXFxcLy4qXCIsXG4gICAgICBcIi4qXFxcXC9tZXRhXFxcXC8uKlwiLFxuICAgIF0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLGNBQWMsYUFBYTtBQUNwQyxTQUFTLHdCQUF3QjtBQUNqQyxTQUFTLHNCQUFzQjtBQUMvQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLG1CQUFtQjtBQUUxQixlQUFlO0FBRWYsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sTUFDRSxRQUFRLElBQUksYUFBYSxlQUFlLE9BQU8sUUFBUSxJQUFJLElBQUssSUFBSTtBQUFBLEVBQ3hFO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNLENBQUMsQ0FBQztBQUFBLElBQ1IsY0FBYztBQUFBLElBQ2QsaUJBQWlCO0FBQUEsTUFDZixLQUFLO0FBQUEsTUFDTCxTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULFdBQVcsQ0FBQyxXQUFXLE1BQU07QUFBQSxJQUM3QixhQUFhO0FBQUEsSUFDYixZQUFZLENBQUMsdUJBQXVCO0FBQUEsSUFDcEMsV0FBVyxDQUFDLG1DQUFtQztBQUFBLElBQy9DLGNBQWM7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
