import { expect, type Locator, type Page } from '@playwright/test';

export class AnomaliesPage {
  readonly heading: Locator;
  readonly cards: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Anomalías IA' });
    this.cards = page.getByRole('main').getByRole('link').filter({ hasText: 'prioridad' });
  }

  async openFromSidebar(): Promise<void> {
    await this.page.getByRole('link', { name: 'Anomalías IA', exact: true }).click();
    await expect(this.page).toHaveURL(/\/anomalies$/);
    await expect(this.heading).toBeVisible();
    await expect(this.cards.first(), 'No hay anomalías: ejecuta Run AI Analysis').toBeVisible();
  }

  async openFirst(): Promise<void> {
    await this.cards.first().click();
    await expect(this.page).toHaveURL(/\/anomalies\/\d+$/);
  }
}
