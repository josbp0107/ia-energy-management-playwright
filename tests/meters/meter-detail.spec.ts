import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';
import { LoginPage } from '../../src/pages/login.page';
import { DashboardPage } from '../../src/pages/dashboard.page';
import { MetersPage } from '../../src/pages/meters.page';
import { MeterDetailPage } from '../../src/pages/meter-detail.page';
import { MetersClient } from '../../src/api/meters.client';
import { EMPTY, formatKWh, formatNumber, formatPct } from '../../src/utils/format';

test.describe('Detalle de medidor', () => {
  test.describe.configure({ timeout: 180_000 });

  test('valida las estadísticas de un medidor aleatorio', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    const metersPage = new MetersPage(page);
    const detail = new MeterDetailPage(page);

    await test.step('Login', async () => {
      await loginPage.goto();
      await loginPage.login(env.user);
      await dashboard.expectLoaded();
    });

    await test.step('Asegurar que existe un análisis de IA', async () => {
      await dashboard.ensureAnalysis();
    });

    await metersPage.openFromSidebar();
    const { row, data: fromTable } = await metersPage.pickRandomRow();
    test.info().annotations.push({ type: 'medidor', description: fromTable.meterId });

    await test.step(`Abrir medidor ${fromTable.meterId}`, async () => {
      await metersPage.openMeter(row);
      await detail.expectLoaded(fromTable.meterId);
    });

    const meter = await MetersClient.fromPage(page).then((api) => api.getMeter(fromTable.meterId));
    const expected = {
      lastDay: formatKWh(meter.last_day_kwh),
      baseline: meter.baseline_kwh_day === null ? EMPTY : formatKWh(meter.baseline_kwh_day),
      variation: meter.variation_pct === null ? EMPTY : formatPct(meter.variation_pct, { signed: true }),
      priority: meter.priority_score === null ? EMPTY : formatNumber(meter.priority_score, 2),
    };

    await test.step('Los valores coinciden con la API', async () => {
      await expect.soft(detail.stat('Consumo último día')).toHaveText(expected.lastDay);
      await expect.soft(detail.stat('Baseline diario')).toHaveText(expected.baseline);
      await expect.soft(detail.stat('Variación')).toHaveText(expected.variation);
      await expect.soft(detail.stat('Prioridad IA')).toHaveText(expected.priority);
    });

    await test.step('Los valores coinciden con la fila de la tabla', async () => {
      await expect.soft(detail.stat('Consumo último día')).toHaveText(fromTable.lastDay);
      await expect.soft(detail.stat('Baseline diario')).toHaveText(fromTable.baseline);
      await expect.soft(detail.stat('Variación')).toHaveText(fromTable.variation);
    });
  });
});
