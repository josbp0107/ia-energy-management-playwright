import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { env } from '../config/env';

export interface MeterSummary {
  meter_id: string;
  name: string;
  location: string;
  last_day_kwh: number;
  baseline_kwh_day: number | null;
  variation_pct: number | null;
  priority_score: number | null;
}

const SESSION_STORAGE_KEY = 'energy.session';

export class MetersClient {
  private constructor(
    private readonly request: APIRequestContext,
    private readonly token: string,
  ) {}

  static async fromPage(page: Page): Promise<MetersClient> {
    const token = await page.evaluate(
      (key) => (JSON.parse(localStorage.getItem(key) ?? '{}') as { token?: string }).token,
      SESSION_STORAGE_KEY,
    );
    if (!token) throw new Error('No hay sesión activa en el navegador.');
    return new MetersClient(page.request, token);
  }

  async getMeter(meterId: string): Promise<MeterSummary> {
    const response = await this.request.get(`${env.apiUrl}/meters/${encodeURIComponent(meterId)}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    expect(response, `GET /meters/${meterId} respondió ${response.status()}`).toBeOK();
    return (await response.json()) as MeterSummary;
  }
}
