"use client";

import { setBrowserCookie } from "@/hooks/useBrowserCookie";
import { useCurrency } from "@/hooks/useCurrency";
import { CURRENCY_COOKIE } from "@/lib/shop/money";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function CurrencySwitcher() {
  const { code, options } = useCurrency();
  if (options.length < 2) return null;

  return (
    <select
      aria-label="Currency"
      value={code}
      onChange={(e) => setBrowserCookie(CURRENCY_COOKIE, e.target.value, ONE_YEAR)}
      className="bg-transparent text-xs font-medium tracking-[0.1em] text-charcoal hover:text-forest cursor-pointer focus:outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
