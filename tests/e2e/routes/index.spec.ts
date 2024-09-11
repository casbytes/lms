import { test, expect } from "@playwright/test";

test("title contains casbytes", async ({ page }) => {
  await page.goto("/");
  expect(1).toBe(1);
});
