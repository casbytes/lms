import { test, expect } from "@playwright/test";

test("title contains casbytes", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/casbytes/);
});

test("signin with github", async ({ page }) => {
  await page.getByText(/github/).click();
  //   await expect(page).
});
