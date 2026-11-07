import type { ExchangeRates } from "@/types/content";

/** Prices are entered in LKR. The others are worked out from the rates in Shop Settings. */
export const BASE_CURRENCY = "LKR";
export const CURRENCIES = [BASE_CURRENCY, "USD", "EUR", "GBP"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

/** Readable by the browser; set by proxy.ts on the first visit and by the switcher after that. */
export const CURRENCY_COOKIE = "av_currency";
/** The country Vercel reported, so shipping starts on the right one. */
export const COUNTRY_COOKIE = "av_country";

const EUROZONE = new Set([
  "AT", "BE", "BG", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

/** The currency a visitor from this country starts with. */
export function currencyForCountry(country: string): CurrencyCode {
  if (country === "LK") return "LKR";
  if (country === "GB") return "GBP";
  return EUROZONE.has(country) ? "EUR" : "USD";
}

/** The rates as stored in Shop Settings. An empty rate means that currency isn't offered. */
export function ratesFromSettings(
  stored: { usd?: number | null; eur?: number | null; gbp?: number | null } | null | undefined
): ExchangeRates {
  return {
    ...(stored?.usd ? { USD: stored.usd } : {}),
    ...(stored?.eur ? { EUR: stored.eur } : {}),
    ...(stored?.gbp ? { GBP: stored.gbp } : {}),
  };
}

/** The currencies on offer: LKR, and any with a rate in Shop Settings. */
export function availableCurrencies(rates: ExchangeRates): CurrencyCode[] {
  return CURRENCIES.filter((code) => code === BASE_CURRENCY || (rates[code] ?? 0) > 0);
}

/** A stored or requested currency, falling back to LKR when it isn't on offer. */
export function resolveCurrency(wanted: string | null | undefined, rates: ExchangeRates): CurrencyCode {
  return availableCurrencies(rates).find((code) => code === wanted) ?? BASE_CURRENCY;
}

/** LKR amounts are whole; the others go to the cent. */
export function convertFromLkr(lkr: number, code: CurrencyCode, rates: ExchangeRates): number {
  if (code === BASE_CURRENCY) return lkr;
  const rate = rates[code];
  if (!rate || rate <= 0) throw new Error(`No exchange rate for ${code}`);
  return Math.round((lkr / rate) * 100) / 100;
}

/**
 * Add or multiply amounts in whole cents, so a basket never totals 59.970000000000006.
 * Each line is unit price × quantity, so totals always match the prices shown.
 */
export function lineTotal(unitPrice: number, quantity: number): number {
  return Math.round(unitPrice * 100) * quantity / 100;
}

export function sumMoney(amounts: number[]): number {
  return amounts.reduce((sum, amount) => sum + Math.round(amount * 100), 0) / 100;
}
