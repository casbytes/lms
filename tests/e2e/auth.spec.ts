import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { PW } from "../playwright-utils";

test.beforeEach(async ({ page }) => {
  await new PW(page).goto();
});

test.describe("Home page", () => {
  test("Should have a title of CASBytes", async ({ page }) => {
    const title = await page.title();
    expect(title).toBe("CASBytes");
  });

  //   test("Should have a description title", async ({ page }) => {
  //     const description = await page.textContent("h1");
  //     const logo = page.locator("img[alt='CASBytes']");
  //     expect(description).toBe(
  //       "Launch Your Software Engineering Career with CASBytes."
  //     );
  //     await expect(logo).toBeVisible();
  //   });
});

test.describe("Authentication", () => {
  test("Magic link signin", async ({ page }) => {
    const pw = new PW(page);
    const signInBtn = pw.page.getByRole("button", { name: "Sign In" });
    await signInBtn.click();
    await pw.page.waitForTimeout(1000);
    const emailInput = pw.page.locator("input[name='email']");
    await emailInput.fill(faker.internet.email());
    const sendMagicLinkBtn = pw.page.locator(
      "button:has-text('Email a magic link')"
    );
    await sendMagicLinkBtn.click();
    await pw.page.waitForTimeout(2000);
    const successMessage = pw.page.getByText(
      /a magic link was sent to ${faker.internet.email}!/i
    );
    await expect(successMessage).toBeVisible();
  });
});
