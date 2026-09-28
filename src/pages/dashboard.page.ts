import { expect, type Locator, type Page } from '@playwright/test';
import { RunAnalysis } from '../components/run-analysis.component';

const DATE_TIME = /\d{2}.*\d{2}:\d{2}/;

export class DashboardPage {
  readonly heading: Locator;
  readonly metersValue: Locator;
  readonly lastAnalysisValue: Locator;
  readonly runAnalysis: RunAnalysis;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Dashboard' });
    this.metersValue = this.kpiValue('Medidores');
    this.lastAnalysisValue = this.kpiValue('Último análisis');
    this.runAnalysis = new RunAnalysis(page);
  }

  private kpiValue(title: string): Locator {
    return this.page
      .locator('[data-slot="card"]')
      .filter({ has: this.page.locator('[data-slot="card-description"]', { hasText: new RegExp(`^${title}$`) }) })
      .locator('[data-slot="card-content"] > div')
      .first();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard$/);
    await expect(this.heading).toBeVisible();
    await expect(this.lastAnalysisValue).toHaveText(/\S/);
  }

  async hasAnalysis(): Promise<boolean> {
    const value = (await this.lastAnalysisValue.innerText()).trim();
    return value !== 'Nunca';
  }

  async expectAnalysisDate(): Promise<void> {
    await expect(this.lastAnalysisValue).toHaveText(DATE_TIME);
  }

  async ensureAnalysis(): Promise<void> {
    if (!(await this.hasAnalysis())) {
      await this.runAnalysis.run();
      await this.runAnalysis.close();
    }
    await this.expectAnalysisDate();
  }

  async getMetersCount(): Promise<number> {
    await expect(this.metersValue).toHaveText(/\d/);
    return Number((await this.metersValue.innerText()).replace(/\D/g, ''));
  }
}
