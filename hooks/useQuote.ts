"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { useCurrency } from "@/hooks/useCurrency";
import { getQuoteAction } from "@/lib/shop/actions/cart";
import { toCartItems, useCartStore } from "@/lib/shop/cartStore";
import type { Quote } from "@/lib/shop/pricing";

interface UseQuote {
  quote: Quote | null;
  loading: boolean;
  error: string | null;
}

/** Live prices, stock and shipping for the basket, from the CMS. */
export function useQuote(country: string | null): UseQuote {
  const lines = useCartStore((state) => state.lines);
  const syncFromQuote = useCartStore((state) => state.syncFromQuote);
  const { code } = useCurrency();
  const items = toCartItems(lines);

  const { data, error, isLoading } = useSWR(
    items.length > 0 ? ["quote", JSON.stringify(items), code, country] : null,
    async () => {
      const result = await getQuoteAction({ items, currency: code, country });
      if (!result.ok) throw new Error(result.message);
      return result.data;
    },
    { keepPreviousData: true, revalidateOnFocus: true }
  );

  useEffect(() => {
    if (data) syncFromQuote(data.lines);
  }, [data, syncFromQuote]);

  return {
    quote: items.length > 0 ? (data ?? null) : null,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
