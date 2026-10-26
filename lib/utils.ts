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

/** "3ml", "100g", "1kg", "12 pcs" — or null when the product has no size yet. */
export function formatSize(product: Pick<Product, "sizeValue" | "sizeUnit">): string | null {
  const { sizeValue, sizeUnit } = product;
  if (sizeValue == null || !sizeUnit) return null;
  return sizeUnit === "pcs" ? `${sizeValue} pcs` : `${sizeValue}${sizeUnit}`;
}
