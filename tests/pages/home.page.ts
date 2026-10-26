import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly searchBox: Locator;

  constructor(private readonly page: Page) {
    this.searchBox = page.getByRole('textbox', { name: 'Search' });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page).toHaveTitle(/Automation Practice/);
  }

  async openAccount(): Promise<void> {
    await this.page.getByRole('link', { name: 'Sign in' }).click();
  }

  async searchFor(product: string): Promise<void> {
    await this.searchBox.fill(product);
    await this.searchBox.press('Enter');
  }
}
