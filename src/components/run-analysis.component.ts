import { expect, type Locator, type Page } from '@playwright/test';

export class RunAnalysis {
  readonly triggerButton: Locator;
  readonly confirmDialog: Locator;
  readonly confirmButton: Locator;
  readonly progressDialog: Locator;
  readonly completedLabel: Locator;
  readonly summary: Locator;
  readonly viewTopAnomalyButton: Locator;

  constructor(private readonly page: Page) {
    this.triggerButton = page.getByRole('button', { name: 'Run AI Analysis' });
    this.confirmDialog = page.getByRole('dialog', { name: '¿Ejecutar el análisis de IA?' });
    this.confirmButton = this.confirmDialog.getByRole('button', { name: 'Ejecutar análisis' });
    this.progressDialog = page.getByRole('dialog', { name: 'Análisis de IA' });
    this.completedLabel = this.progressDialog.getByText('Completado', { exact: true });
    this.summary = this.progressDialog.getByText(/\d+ anomalías detectadas, \d+ de alta prioridad/);
    this.viewTopAnomalyButton = this.progressDialog.getByRole('button', { name: 'Ver anomalía principal' });
  }

  async start(): Promise<void> {
    await this.triggerButton.click();
    await expect(this.confirmDialog).toBeVisible();
    await this.confirmButton.click();
    await expect(this.progressDialog).toBeVisible();
  }

  async waitForCompletion(timeout = 120_000): Promise<void> {
    await expect(this.completedLabel).toBeVisible({ timeout });
    await expect(this.summary).toBeVisible();
    await expect(this.viewTopAnomalyButton).toBeEnabled();
  }

  async run(): Promise<void> {
    await this.start();
    await this.waitForCompletion();
  }

  async close(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.progressDialog).toBeHidden();
  }
}
