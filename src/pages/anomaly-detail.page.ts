import { expect, type Locator, type Page } from '@playwright/test';

export type AnomalyStatus = 'Abierta' | 'En investigación' | 'Resuelta' | 'Descartada';
export type StatusAction = 'Investigar' | 'Marcar resuelta' | 'Descartar' | 'Reabrir';

export class AnomalyDetailPage {
  readonly heading: Locator;
  readonly actionCard: Locator;
  readonly statusLabel: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.actionCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('Acción recomendada', { exact: true }) });
    this.statusLabel = this.actionCard.getByText(/^Estado:/);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toHaveText(/\S/);
    await expect(this.statusLabel).toBeVisible();
  }

  async getMeterId(): Promise<string> {
    return (await this.heading.innerText()).trim();
  }

  async getStatus(): Promise<AnomalyStatus> {
    const text = (await this.statusLabel.innerText()).replace('Estado:', '').trim();
    return text as AnomalyStatus;
  }

  async expectStatus(status: AnomalyStatus): Promise<void> {
    await expect(this.statusLabel).toHaveText(new RegExp(`Estado:\\s*${status}$`));
  }

  actionButton(action: StatusAction): Locator {
    return this.actionCard.getByRole('button', { name: action, exact: true });
  }

  async changeStatus(action: StatusAction): Promise<void> {
    const response = this.page.waitForResponse(
      (res) => /\/anomalies\/\d+/.test(res.url()) && res.request().method() === 'PATCH',
    );
    await this.actionButton(action).click();
    expect((await response).ok(), 'PATCH del estado de la anomalía falló').toBe(true);
  }
}
