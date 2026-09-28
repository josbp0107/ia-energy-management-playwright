import { expect, type Locator, type Page } from '@playwright/test';
import type { Credentials } from '../config/env';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Correo');
    this.passwordInput = page.getByLabel('Contraseña');
    this.submitButton = page.getByRole('button', { name: 'Entrar' });
    this.errorAlert = page.getByRole('alert').filter({ hasText: /\S/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login({ email, password }: Credentials): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.errorAlert).toContainText(message);
  }
}
