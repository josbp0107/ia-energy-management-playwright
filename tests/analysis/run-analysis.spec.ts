import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';
import { LoginPage } from '../../src/pages/login.page';
import { DashboardPage } from '../../src/pages/dashboard.page';

test.describe('Análisis de IA', () => {
  test.describe.configure({ timeout: 180_000 });

  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    dashboard = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(env.user);
    await dashboard.expectLoaded();
  });

  test('ejecuta el análisis y muestra la anomalía principal', async () => {
    const { runAnalysis } = dashboard;

    await test.step('Confirmar la ejecución en el modal', async () => {
      await runAnalysis.start();
    });

    await test.step('Esperar a que terminen todos los pasos', async () => {
      await runAnalysis.waitForCompletion();
    });

    await test.step('Se muestra el resumen y el botón de la anomalía principal', async () => {
      await expect(runAnalysis.summary).toContainText('anomalías detectadas');
      await expect(runAnalysis.viewTopAnomalyButton).toBeVisible();
    });

    await test.step('El dashboard refleja la fecha del último análisis', async () => {
      await runAnalysis.close();
      await dashboard.expectAnalysisDate();
    });
  });
});
