import { expect, type Locator, type Page } from '@playwright/test';
import { parseLocaleNumber } from '../utils/format';

export interface MeterRow {
  meterId: string;
  lastDay: string;
  baseline: string;
  variation: string;
}

export type MeterSort = 'Severidad' | 'Variación' | 'Consumo';

export class MetersPage {
  readonly heading: Locator;
  readonly rows: Locator;
  readonly allFilter: Locator;
  readonly searchInput: Locator;
  readonly sortSelect: Locator;
  readonly emptyMessage: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Medidores' });
    this.rows = page.getByRole('table').getByRole('row').filter({ has: page.getByRole('link') });
    this.allFilter = page.getByRole('radio', { name: /^Todos\s*\d+$/ });
    this.searchInput = page.getByRole('textbox', { name: 'Buscar medidor' });
    this.sortSelect = page.getByRole('combobox', { name: 'Ordenar por' });
    this.emptyMessage = page.getByText('Ningún medidor coincide con los filtros.');
  }

  async getAllFilterCount(): Promise<number> {
    await expect(this.allFilter).toHaveText(/\d/);
    return Number((await this.allFilter.innerText()).replace(/\D/g, ''));
  }

  async openFromSidebar(): Promise<void> {
    await this.page.getByRole('link', { name: 'Medidores', exact: true }).click();
    await expect(this.page).toHaveURL(/\/meters$/);
    await expect(this.heading).toBeVisible();
    await expect(this.rows.first()).toBeVisible();
  }

  async search(text: string): Promise<void> {
    await this.searchInput.fill(text);
    await expect(this.page).toHaveURL(new RegExp(`[?&]q=${encodeURIComponent(text)}`));
  }

  async sortBy(option: MeterSort): Promise<void> {
    await this.sortSelect.click();
    await this.page.getByRole('option', { name: `Ordenar: ${option}` }).click();
    await expect(this.sortSelect).toHaveText(`Ordenar: ${option}`);
  }

  async getMeterIds(): Promise<string[]> {
    return (await this.rows.getByRole('link').allInnerTexts()).map((id) => id.trim());
  }

  async getVariations(): Promise<number[]> {
    const texts = await this.rows.locator('td:nth-child(5)').allInnerTexts();
    return texts.map((text) => parseLocaleNumber(text) ?? 0);
  }

  async pickRandomRow(): Promise<{ row: Locator; data: MeterRow }> {
    const count = await this.rows.count();
    expect(count, 'La tabla de medidores está vacía').toBeGreaterThan(0);

    const row = this.rows.nth(Math.floor(Math.random() * count));
    const cells = row.getByRole('cell');
    const data: MeterRow = {
      meterId: (await row.getByRole('link').innerText()).trim(),
      lastDay: (await cells.nth(2).innerText()).trim(),
      baseline: (await cells.nth(3).innerText()).trim(),
      variation: (await cells.nth(4).innerText()).trim(),
    };
    return { row, data };
  }

  async openMeter(row: Locator): Promise<void> {
    await row.getByRole('link').click();
  }
}
