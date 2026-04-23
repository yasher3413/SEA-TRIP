// Hardcoded exchange rates to CAD (approximate at trip time)
// TODO: replace with live FX API (e.g. Open Exchange Rates) for real-time accuracy
export const FX_RATES: Record<string, number> = {
  CAD: 1,
  USD: 1.38,
  TWD: 0.044,
  VND: 0.000059,
  MYR: 0.31,
  SGD: 1.04,
};

export function toCAD(amount: number, currency: string): number {
  const rate = FX_RATES[currency] ?? 1;
  return Math.round(amount * rate * 100) / 100;
}
