"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { OrderDetails } from "@/components/features/checkout/OrderDetails";
import { primaryButtonClass } from "@/components/ui/SubmitButton";
import { getOrderAction } from "@/lib/shop/actions/checkout";
import { useCartStore } from "@/lib/shop/cartStore";
import type { OrderView } from "@/lib/shop/orderView";

const POLL_MS = 3000;
const GIVE_UP_MS = 90_000;

/**
 * PayHere sends the customer back as soon as they've paid, and tells us
 * separately. Only PayHere's own report marks the order paid, so this waits for
 * it rather than taking the browser's word for it.
 */
export function PaymentConfirmation({ initial }: { initial: OrderView }) {
  const clearCart = useCartStore((state) => state.clear);
  const [waitedTooLong, setWaitedTooLong] = useState(false);

  const { data } = useSWR(
    ["order", initial.token],
    async () => {
      const result = await getOrderAction(initial.token);
      if (!result.ok) throw new Error(result.message);
      return result.data;
    },
    {
      fallbackData: initial,
      revalidateOnMount: true,
      // Until it's paid, not only while it's waiting: a payment just after the order
      // expired finds it cancelled for a moment before PayHere's report revives it.
      // SWR passes undefined here until its first fetch, even with fallback data.
      refreshInterval: (latest) => (!(latest ?? initial).isPaid && !waitedTooLong ? POLL_MS : 0),
    }
  );
  const order = data ?? initial;

  useEffect(() => {
    if (order.isPaid) clearCart();
  }, [order.isPaid, clearCart]);

  useEffect(() => {
    const timer = setTimeout(() => setWaitedTooLong(true), GIVE_UP_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!order.isPaid) {
    return (
      <div className="text-center max-w-md mx-auto" role="status">
        <h2 className="font-heading text-2xl font-bold text-charcoal mb-3">Confirming your payment…</h2>
        <p className="text-sm text-muted mb-6">
          {waitedTooLong
            ? `This is taking longer than usual. If you paid, we'll email ${order.email} as soon as PayHere confirms it. Your order number is ${order.orderNumber}.`
            : "This usually takes a few seconds. Please keep this page open."}
        </p>
        <Link href={`/order/${order.token}`} className="text-sm text-forest underline underline-offset-2">
          View your order
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">Thank you, your order is confirmed</h2>
      <p className="text-sm text-muted mb-8">
        Your order number is <strong className="text-charcoal">{order.orderNumber}</strong>. We&apos;ve sent the details to{" "}
        {order.email}.
      </p>
      <OrderDetails order={order} />
      <div className="mt-8">
        <Link href="/products" className={primaryButtonClass}>
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
