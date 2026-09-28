import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';
import { LoginPage } from '../../src/pages/login.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { MetersPage } from '../../src/pages/meters.page';

test.describe('Medidores - búsqueda', () => {
  let metersPage: MetersPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    metersPage = new MetersPage(page);

    await loginPage.goto();
    await loginPage.login(env.user);
    await new DashboardPage(page).expectLoaded();
    await metersPage.openFromSidebar();
  });

  test('busca un medidor por su identificador', async () => {
    const { data } = await metersPage.pickRandomRow();
    test.info().annotations.push({ type: 'búsqueda', description: data.meterId });

    await metersPage.search(data.meterId);

    await expect(metersPage.rows.getByRole('link', { name: data.meterId, exact: true })).toBeVisible();
    const ids = await metersPage.getMeterIds();
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(id).toContain(data.meterId);
    }
  });

  test('muestra mensaje cuando ningún medidor coincide', async () => {
    await metersPage.search(`NO-EXISTE-${Date.now()}`);

    await expect(metersPage.emptyMessage).toBeVisible();
    await expect(metersPage.rows).toHaveCount(0);
  });
});
