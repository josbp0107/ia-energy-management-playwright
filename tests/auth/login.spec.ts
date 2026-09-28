import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';
import { LoginPage } from '../../src/pages/login.page';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('inicia sesión con usuario demo', async ({ page }) => {
    await loginPage.login(env.user);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  });

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await loginPage.login({ email: env.user.email, password: `wrong-${Date.now()}` });

    await loginPage.expectError('Correo o contraseña incorrectos.');
    await expect(page).toHaveURL(/\/login$/);
  });
});
