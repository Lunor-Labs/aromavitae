"use client";

import { CartButton } from "@/components/features/cart/CartButton";
import { CartDrawer } from "@/components/features/cart/CartDrawer";
import { AccountLink } from "@/components/features/shop/AccountLink";
import { CurrencySwitcher } from "@/components/features/shop/CurrencySwitcher";
import { useShop } from "@/components/features/shop/ShopProvider";

/** The shop's part of the navbar. Nothing shows while the shop is off. */
export function ShopNav() {
  const { enabled } = useShop();
  if (!enabled) return null;

  return (
    <div className="flex items-center gap-3">
      <CurrencySwitcher />
      <AccountLink />
      <CartButton />
      <CartDrawer />
    </div>
  );
}
