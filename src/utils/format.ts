const LOCALE = 'es-CO';

export function formatNumber(value: number, decimals = 1): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export const formatKWh = (value: number, decimals = 1): string => `${formatNumber(value, decimals)} kWh`;

export function formatPct(value: number, { signed = false, decimals = 1 } = {}): string {
  const sign = signed && value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, decimals)} %`;
}

export const EMPTY = '—';

export function parseLocaleNumber(text: string): number | null {
  const clean = text.replace(/[^\d,.+\-−]/g, '').replace('−', '-');
  if (!/\d/.test(clean)) return null;
  return Number(clean.replace(/\./g, '').replace(',', '.'));
}
