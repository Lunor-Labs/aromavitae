"use client";

import { useShop } from "@/components/features/shop/ShopProvider";
import { useBrowserCookie } from "@/hooks/useBrowserCookie";
import {
  BASE_CURRENCY,
  CURRENCY_COOKIE,
  availableCurrencies,
  convertFromLkr,
  resolveCurrency,
  type CurrencyCode,
} from "@/lib/shop/money";

interface UseCurrency {
  code: CurrencyCode;
  options: CurrencyCode[];
  convert: (lkr: number) => number;
}

/** The currency this visitor sees. Always LKR while the shop is off. */
export function useCurrency(): UseCurrency {
  const { enabled, settings } = useShop();
  const cookie = useBrowserCookie(CURRENCY_COOKIE);
  const code = enabled ? resolveCurrency(cookie, settings.rates) : BASE_CURRENCY;
  return {
    code,
    options: enabled ? availableCurrencies(settings.rates) : [BASE_CURRENCY],
    convert: (lkr) => convertFromLkr(lkr, code, settings.rates),
  };
}
