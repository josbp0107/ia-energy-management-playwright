import { expect, type Locator, type Page } from '@playwright/test';

export type MeterStat = 'Consumo último día' | 'Baseline diario' | 'Variación' | 'Prioridad IA';

export class MeterDetailPage {
  constructor(private readonly page: Page) {}

  heading(meterId: string): Locator {
    return this.page.getByRole('heading', { level: 1, name: meterId, exact: true });
  }

  stat(label: MeterStat): Locator {
    return this.page
      .locator('[data-slot="card"]')
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .locator('[data-slot="card-content"] > span')
      .nth(1);
  }

  async expectLoaded(meterId: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/meters/${meterId}$`));
    await expect(this.heading(meterId)).toBeVisible();
  }
}
