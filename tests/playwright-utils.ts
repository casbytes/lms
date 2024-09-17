import { Locator, Page } from "@playwright/test";

export class PW {
  readonly Input: Locator;
  readonly Labels: Locator;
  constructor(public readonly page: Page) {
    this.Input = page.locator("input");
    this.Labels = page.locator("label");
  }

  async goto(url: string = "http://localhost:5173") {
    await this.page.goto(url);
  }

  async btn(match: string) {
    await this.page.locator(match).click();
  }
}
