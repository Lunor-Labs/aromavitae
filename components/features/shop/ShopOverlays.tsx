"use client";

import { CartDrawer } from "@/components/features/cart/CartDrawer";
import { useShop } from "@/components/features/shop/ShopProvider";

/**
 * Lives outside the navbar on purpose: once the page scrolls, the navbar's blur
 * becomes the containing block for anything `fixed` inside it, which would pin
 * the drawer to the navbar instead of the screen.
 */
export function ShopOverlays() {
  const { enabled } = useShop();
  return enabled ? <CartDrawer /> : null;
}
