import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';
import { LoginPage } from '../../src/pages/login.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { MetersPage } from '../../src/pages/meters.page';

test.describe('Medidores - ordenamiento', () => {
  test('ordena por variación de mayor a menor (valor absoluto)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const metersPage = new MetersPage(page);

    await loginPage.goto();
    await loginPage.login(env.user);
    await new DashboardPage(page).expectLoaded();
    await metersPage.openFromSidebar();

    await metersPage.sortBy('Variación');
    await expect(page).toHaveURL(/[?&]sort=variation/);

    const variations = (await metersPage.getVariations()).map(Math.abs);
    expect(variations.length).toBeGreaterThan(1);
    expect(variations).toEqual([...variations].sort((a, b) => b - a));
  });
});
