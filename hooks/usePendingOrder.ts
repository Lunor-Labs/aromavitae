"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { getOrderAction } from "@/lib/shop/actions/checkout";
import { cartKey, useCartStore, type CartLine } from "@/lib/shop/cartStore";
import type { OrderView } from "@/lib/shop/orderView";

export type PendingOrderState =
  | { kind: "none" }
  | { kind: "checking" }
  | { kind: "waiting"; order: OrderView }
  | { kind: "paid"; order: OrderView };

/**
 * Whether this cart already has an order waiting for payment, so checkout can
 * offer to finish paying for it instead of placing a second one.
 */
export function usePendingOrder(lines: CartLine[], mounted: boolean) {
  const pending = useCartStore((state) => state.pendingOrder);
  const setPendingOrder = useCartStore((state) => state.setPendingOrder);
  const clearCart = useCartStore((state) => state.clear);
  const [paid, setPaid] = useState<OrderView | null>(null);

  // A changed cart is a different purchase, so its old order is ignored.
  const matches = mounted && pending !== null && pending.cartKey === cartKey(lines);
  const { data, error, mutate } = useSWR(
    matches ? ["pending-order", pending.token] : null,
    async ([, token]: [string, string]): Promise<OrderView | null> => {
      const result = await getOrderAction(token);
      if (result.ok) return result.data;
      if (result.status === 404) return null;
      throw new Error(result.message);
    },
    {
      onSuccess: (order) => {
        if (order?.isPaid) {
          setPaid(order);
          clearCart();
        } else if (!order?.canRetry) {
          setPendingOrder(null); // gone, expired or out of attempts: nothing left to pay
        }
      },
    }
  );

  useEffect(() => {
    // Back from PayHere, the page may be restored as it was: check the order again.
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) void mutate();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [mutate]);

  // If the shop can't be reached, checkout shows as normal rather than hanging.
  let state: PendingOrderState = { kind: "none" };
  if (paid) state = { kind: "paid", order: paid };
  else if (matches && !error) {
    if (data === undefined) state = { kind: "checking" };
    else if (data?.canRetry && !data.isPaid) state = { kind: "waiting", order: data };
  }

  return { state, startNew: () => setPendingOrder(null) };
}
