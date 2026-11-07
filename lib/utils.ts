import { type ClassValue, clsx } from "clsx";
import type { Product } from "@/types/product";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "LKR 5,300" */
// A fixed locale: the visitor's own could render 1,19,539 or 119.539, and differ
// between the server render and the browser.
const wholeFormat = new Intl.NumberFormat("en-US");
const centsFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** LKR prices are whole; foreign ones always show the cents. */
const formatAmount = (currency: string, amount: number) =>
  (currency === "LKR" ? wholeFormat : centsFormat).format(amount);

export function formatPrice(currency: string, amount: number): string {
  return `${currency} ${formatAmount(currency, amount)}`;
}

/** "LKR 18,000–24,000" */
export function formatPriceRange(currency: string, min: number, max: number): string {
  return `${currency} ${formatAmount(currency, min)}–${formatAmount(currency, max)}`;
}

/** 7,575 → 5,300 is 30 (percent off), or null when there is no discount. */
export function percentOff(price: number, salePrice?: number | null): number | null {
  if (salePrice == null || price <= 0 || salePrice >= price) return null;
  return Math.round(((price - salePrice) / price) * 100);
}

/** "3ml", "100g", "1kg", "12 pcs" — or null when the product has no size yet. */
export function formatSize(product: Pick<Product, "sizeValue" | "sizeUnit">): string | null {
  const { sizeValue, sizeUnit } = product;
  if (sizeValue == null || !sizeUnit) return null;
  return sizeUnit === "pcs" ? `${sizeValue} pcs` : `${sizeValue}${sizeUnit}`;
}
