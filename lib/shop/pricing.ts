import { z } from "zod";
import { HOME_COUNTRY } from "@/lib/shop/countries";
import { BASE_CURRENCY, convertFromLkr, lineTotal, resolveCurrency, sumMoney, type CurrencyCode } from "@/lib/shop/money";
import { shippingOptions, type ShippingOption, type ShippingZone } from "@/lib/shop/shipping";
import type { ExchangeRates } from "@/types/content";

/** What a basket costs. Only the CMS runs this for real: the browser's prices are display-only. */

export const MAX_QUANTITY = 99;

export const cartItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  variantId: z.string().max(64).nullable(),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;

export interface CatalogVariant {
  id: string;
  sizeLabel: string | null;
  price: number;
  salePrice: number | null;
  stock: number | null;
  weightGrams: number | null;
  image: string | null;
}

export interface CatalogProduct {
  id: number;
  name: string;
  sizeLabel: string | null;
  price: number;
  salePrice: number | null;
  priceMax: number | null;
  stock: number | null;
  weightGrams: number | null;
  domesticOnly: boolean;
  image: string | null;
  variants: CatalogVariant[];
}

export interface QuoteLine {
  productId: number;
  variantId: string | null;
  name: string;
  sizeLabel: string | null;
  image: string | null;
  quantity: number;
  unitPriceLkr: number;
  lineTotalLkr: number;
  unitPrice: number;
  lineTotal: number;
  weightGrams: number;
  /** How many can be bought. Null means stock isn't tracked. */
  available: number | null;
  /** Why this line can't be bought as it is, in the customer's words. */
  problem: string | null;
}

export interface QuoteShippingOption extends ShippingOption {
  price: number;
}

export interface Quote {
  currency: CurrencyCode;
  /** How many LKR one unit of `currency` costs. 1 for LKR. */
  rate: number;
  lines: QuoteLine[];
  subtotalLkr: number;
  subtotal: number;
  weightGrams: number;
  /** Null until a country is chosen; empty when nothing can ship there. */
  shipping: QuoteShippingOption[] | null;
}

interface QuoteInput {
  items: CartItemInput[];
  products: CatalogProduct[];
  zones: ShippingZone[];
  rates: ExchangeRates;
  defaultWeightGrams: number;
  currency?: string | null;
  country?: string | null;
}

/** The same size added twice counts as one line, so stock is checked against the total. */
function mergeItems(items: CartItemInput[]): CartItemInput[] {
  const merged = new Map<string, CartItemInput>();
  for (const item of items) {
    const key = `${item.productId}:${item.variantId ?? ""}`;
    const existing = merged.get(key);
    merged.set(key, existing ? { ...item, quantity: existing.quantity + item.quantity } : item);
  }
  return [...merged.values()];
}

const effectivePrice = (item: { price: number; salePrice: number | null }) =>
  item.salePrice != null && item.salePrice < item.price ? item.salePrice : item.price;

function stockProblem(available: number | null, quantity: number): string | null {
  if (available == null || available >= quantity) return null;
  return available <= 0 ? "Sold out" : `Only ${available} left`;
}

const UNAVAILABLE = "No longer available";

function priceLine(item: CartItemInput, input: QuoteInput, currency: CurrencyCode): QuoteLine {
  const product = input.products.find((p) => p.id === item.productId);
  const variant = product?.variants.find((v) => v.id === item.variantId) ?? null;
  const priced = variant ?? product;

  const base = (lkr: number) => ({
    unitPriceLkr: lkr,
    lineTotalLkr: lkr * item.quantity,
    unitPrice: convertFromLkr(lkr, currency, input.rates),
    lineTotal: lineTotal(convertFromLkr(lkr, currency, input.rates), item.quantity),
  });

  const needsSize = Boolean(product?.variants.length) && !variant;
  if (!product || !priced || needsSize || (item.variantId && !variant)) {
    return {
      productId: item.productId,
      variantId: item.variantId,
      name: product?.name ?? "This product",
      sizeLabel: null,
      image: product?.image ?? null,
      quantity: item.quantity,
      ...base(0),
      weightGrams: 0,
      available: 0,
      problem: UNAVAILABLE,
    };
  }

  const domesticOnly = product.domesticOnly && Boolean(input.country) && input.country !== HOME_COUNTRY;
  const hasRange = !variant && product.priceMax != null;
  return {
    productId: product.id,
    variantId: variant?.id ?? null,
    name: product.name,
    sizeLabel: variant ? variant.sizeLabel : product.sizeLabel,
    image: variant?.image ?? product.image,
    quantity: item.quantity,
    ...base(effectivePrice(priced)),
    weightGrams: (priced.weightGrams ?? input.defaultWeightGrams) * item.quantity,
    available: priced.stock,
    problem: hasRange
      ? "Please contact us for the exact price"
      : domesticOnly
        ? "Can only be shipped within Sri Lanka"
        : stockProblem(priced.stock, item.quantity),
  };
}

export function buildQuote(input: QuoteInput): Quote {
  const currency = resolveCurrency(input.currency, input.rates);
  const lines = mergeItems(input.items).map((item) => priceLine(item, input, currency));
  const buyable = lines.filter((line) => !line.problem);

  const subtotalLkr = buyable.reduce((sum, line) => sum + line.lineTotalLkr, 0);
  const weightGrams = buyable.reduce((sum, line) => sum + line.weightGrams, 0);

  return {
    currency,
    rate: currency === BASE_CURRENCY ? 1 : (input.rates[currency] ?? 1),
    lines,
    subtotalLkr,
    subtotal: sumMoney(buyable.map((line) => line.lineTotal)),
    weightGrams,
    shipping: input.country
      ? shippingOptions(input.zones, input.country, weightGrams, subtotalLkr).map((option) => ({
          ...option,
          price: convertFromLkr(option.priceLkr, currency, input.rates),
        }))
      : null,
  };
}
