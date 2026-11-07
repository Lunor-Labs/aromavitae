"use server";

import { cmsFetch, type CmsResult } from "@/lib/shop/cms";
import type { CartItemInput, Quote } from "@/lib/shop/pricing";

interface QuoteRequest {
  items: CartItemInput[];
  currency: string;
  country: string | null;
}

export async function getQuoteAction(request: QuoteRequest): Promise<CmsResult<Quote>> {
  return cmsFetch<Quote>("shop/quote", { method: "POST", body: request });
}
