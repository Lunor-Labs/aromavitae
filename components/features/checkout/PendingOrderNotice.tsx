"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FormMessage } from "@/components/ui/FormMessage";
import { primaryButtonClass } from "@/components/ui/SubmitButton";
import { usePayHereRedirect } from "@/hooks/usePayHereRedirect";
import { retryPaymentAction } from "@/lib/shop/actions/checkout";
import type { OrderView } from "@/lib/shop/orderView";

const linkClass = "text-sm text-forest underline underline-offset-2";

/** This cart's order is still waiting: pay for that one, rather than placing it again. */
export function PendingOrderNotice({ order, onStartNew }: { order: OrderView; onStartNew: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { redirecting, redirect } = usePayHereRedirect();

  const resume = () => {
    setError(null);
    startTransition(async () => {
      const result = await retryPaymentAction(order.token);
      if (result.ok) redirect(result.data);
      else setError(result.message);
    });
  };

  return (
    <div className="text-center max-w-md mx-auto space-y-5">
      <h2 className="font-heading text-2xl font-bold text-charcoal">Order {order.orderNumber} is waiting for payment</h2>
      <p className="text-sm text-muted">
        You&apos;ve already placed this order. Pay for it here so you aren&apos;t charged twice. If you&apos;ve just paid, give it a
        minute: we&apos;ll email {order.email} as soon as PayHere confirms it.
      </p>
      <FormMessage error={error ?? undefined} />
      <button type="button" onClick={resume} disabled={pending || redirecting} className={primaryButtonClass}>
        {pending || redirecting ? "Taking you to PayHere…" : "Continue to payment"}
      </button>
      <p className="text-xs text-muted">
        {order.attemptsLeft === 1 ? "This is your last attempt for this order." : `${order.attemptsLeft} attempts left.`}
      </p>
      <p>
        <button type="button" onClick={onStartNew} className={linkClass}>
          Start a new order instead
        </button>
      </p>
    </div>
  );
}

/** Back at checkout after paying: say so, instead of offering to take the money again. */
export function AlreadyPaidNotice({ order }: { order: OrderView }) {
  return (
    <div className="text-center max-w-md mx-auto space-y-5">
      <h2 className="font-heading text-2xl font-bold text-charcoal">Order {order.orderNumber} is paid</h2>
      <p className="text-sm text-muted">Thank you. We&apos;ve sent the details to {order.email}.</p>
      <div className="flex flex-col items-center gap-3">
        <Link href={`/order/${order.token}`} className={primaryButtonClass}>
          View your order
        </Link>
        <Link href="/products" className={linkClass}>
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
