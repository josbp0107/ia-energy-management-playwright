import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';
import { LoginPage } from '../../src/pages/login.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { AnomaliesPage } from '../../src/pages/anomalies.page';
import { AnomalyDetailPage, type AnomalyStatus, type StatusAction } from '../../src/pages/anomaly-detail.page';

test.describe('Anomalías IA - estado', () => {
  test.describe.configure({ timeout: 180_000 });

  test('marca como resuelta la primera anomalía, o la reabre si ya estaba resuelta', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const anomaliesPage = new AnomaliesPage(page);
    const detail = new AnomalyDetailPage(page);

    await test.step('Login y asegurar que existe un análisis', async () => {
      await loginPage.goto();
      await loginPage.login(env.user);
      await dashboard.expectLoaded();
      await dashboard.ensureAnalysis();
    });

    await test.step('Abrir la primera anomalía', async () => {
      await anomaliesPage.openFromSidebar();
      await anomaliesPage.openFirst();
      await detail.expectLoaded();
    });

    const meterId = await detail.getMeterId();
    const initial = await detail.getStatus();
    const isClosed = initial === 'Resuelta' || initial === 'Descartada';
    const action: StatusAction = isClosed ? 'Reabrir' : 'Marcar resuelta';
    const expected: AnomalyStatus = isClosed ? 'Abierta' : 'Resuelta';
    test.info().annotations.push({ type: 'anomalía', description: `${meterId}: ${initial} → ${expected}` });

    await test.step(`${action} (estado actual: ${initial})`, async () => {
      await detail.changeStatus(action);
      await detail.expectStatus(expected);
      await expect(page.getByText(`Anomalía ${meterId}: ${expected.toLowerCase()}`)).toBeVisible();
    });

    await test.step('El estado persiste tras recargar', async () => {
      await page.reload();
      await detail.expectLoaded();
      await detail.expectStatus(expected);
    });
  });
});
