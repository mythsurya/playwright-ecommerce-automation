import { expect, type Page } from '@playwright/test';

export class AccountPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/my-account');
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.page.getByRole('heading', { name: 'Authentication' })).toBeVisible();
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.page.locator('#email').fill(email);
    await this.page.locator('#passwd').fill(password);
    await this.page.locator('#SubmitLogin').click();
  }
}
