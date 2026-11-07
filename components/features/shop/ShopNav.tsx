"use client";

import { CurrencySwitcher } from "@/components/features/shop/CurrencySwitcher";
import { useShop } from "@/components/features/shop/ShopProvider";

/** The shop's part of the navbar. Nothing shows while the shop is off. */
export function ShopNav() {
  const { enabled } = useShop();
  if (!enabled) return null;

  return (
    <div className="flex items-center gap-3">
      <CurrencySwitcher />
    </div>
  );
}
