import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';
import { LoginPage } from '../../src/pages/login.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { MetersPage } from '../../src/pages/meters.page';

test.describe('Dashboard', () => {
  test('el número de medidores coincide con la sección Medidores', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const metersPage = new MetersPage(page);

    await test.step('Login', async () => {
      await loginPage.goto();
      await loginPage.login(env.user);
      await dashboard.expectLoaded();
    });

    const dashboardCount = await test.step('Leer el KPI Medidores del dashboard', async () => {
      const count = await dashboard.getMetersCount();
      expect(count).toBeGreaterThan(0);
      return count;
    });
    test.info().annotations.push({ type: 'medidores', description: String(dashboardCount) });

    await test.step('Ir a la sección Medidores', async () => {
      await metersPage.openFromSidebar();
    });

    await test.step('El filtro "Todos" y la tabla muestran el mismo número', async () => {
      expect.soft(await metersPage.getAllFilterCount()).toBe(dashboardCount);
      await expect.soft(metersPage.rows).toHaveCount(dashboardCount);
    });
  });
});
