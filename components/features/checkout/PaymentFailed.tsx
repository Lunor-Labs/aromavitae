"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FormMessage } from "@/components/ui/FormMessage";
import { primaryButtonClass } from "@/components/ui/SubmitButton";
import { retryPaymentAction } from "@/lib/shop/actions/checkout";
import type { OrderView } from "@/lib/shop/orderView";
import { usePayHereRedirect } from "@/hooks/usePayHereRedirect";

interface PaymentFailedProps {
  order: OrderView;
  /** Digits only, for a wa.me link. */
  whatsapp: string;
  email: string;
}

const contactLink = "text-forest underline underline-offset-2";

export function PaymentFailed({ order, whatsapp, email }: PaymentFailedProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { redirecting, redirect } = usePayHereRedirect();

  const retry = () => {
    setError(null);
    startTransition(async () => {
      const result = await retryPaymentAction(order.token);
      if (result.ok) redirect(result.data);
      else setError(result.message);
    });
  };

  const help = encodeURIComponent(`Hi, I need help paying for order ${order.orderNumber}.`);

  return (
    <div className="text-center max-w-md mx-auto space-y-5">
      <h2 className="font-heading text-2xl font-bold text-charcoal">Your payment didn&apos;t go through</h2>
      <p className="text-sm text-muted">
        You haven&apos;t been charged for order <strong className="text-charcoal">{order.orderNumber}</strong>.
        {order.canRetry && " Your cart is still saved, and we're holding your items for a little while."}
      </p>
      <FormMessage error={error ?? undefined} />

      {order.canRetry ? (
        <>
          <button type="button" onClick={retry} disabled={pending || redirecting} className={primaryButtonClass}>
            {pending || redirecting ? "Taking you to PayHere…" : "Try again"}
          </button>
          <p className="text-xs text-muted">
            {order.attemptsLeft === 1 ? "This is your last attempt for this order." : `${order.attemptsLeft} attempts left.`}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">
          This order can&apos;t be paid for any more, so please{" "}
          <Link href="/cart" className={contactLink}>
            go back to your cart
          </Link>{" "}
          to try again.
        </p>
      )}

      <p className="text-sm text-muted pt-4 border-t border-border">
        Need a hand? Message us on{" "}
        <a href={`https://wa.me/${whatsapp}?text=${help}`} target="_blank" rel="noopener noreferrer" className={contactLink}>
          WhatsApp
        </a>{" "}
        or email{" "}
        <a href={`mailto:${email}?subject=Order%20${order.orderNumber}`} className={contactLink}>
          {email}
        </a>
        , quoting your order number.
      </p>
    </div>
  );
}
