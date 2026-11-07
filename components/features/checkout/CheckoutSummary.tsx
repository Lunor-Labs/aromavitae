import { sumMoney } from "@/lib/shop/money";
import type { Quote, QuoteShippingOption } from "@/lib/shop/pricing";
import { formatPrice } from "@/lib/utils";

interface CheckoutSummaryProps {
  quote: Quote;
  shipping: QuoteShippingOption | null;
  children: React.ReactNode;
}

const row = "flex justify-between gap-3 text-sm";

export function CheckoutSummary({ quote, shipping, children }: CheckoutSummaryProps) {
  const total = sumMoney([quote.subtotal, shipping?.price ?? 0]);
  return (
    <aside className="h-fit lg:sticky lg:top-24 bg-cream border border-border rounded-lg p-6">
      <h2 className="font-heading text-lg font-bold text-charcoal mb-4">Your order</h2>
      <ul className="space-y-3 mb-5">
        {quote.lines.map((line) => (
          <li key={`${line.productId}:${line.variantId ?? ""}`} className="text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-charcoal">
                {line.name} × {line.quantity}
              </span>
              {!line.problem && <span className="text-charcoal shrink-0">{formatPrice(quote.currency, line.lineTotal)}</span>}
            </div>
            {line.sizeLabel && <p className="text-xs text-muted">{line.sizeLabel}</p>}
            {line.problem && <p className="text-xs font-medium text-red-800">{line.problem}</p>}
          </li>
        ))}
      </ul>
      <dl className="space-y-2 border-t border-border pt-4 mb-5">
        <div className={row}>
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPrice(quote.currency, quote.subtotal)}</dd>
        </div>
        <div className={row}>
          <dt className="text-muted">Shipping</dt>
          <dd>{!shipping ? "—" : shipping.price === 0 ? "Free" : formatPrice(quote.currency, shipping.price)}</dd>
        </div>
        <div className={`${row} border-t border-border pt-2 text-base font-bold text-charcoal`}>
          <dt>Total</dt>
          <dd>{formatPrice(quote.currency, total)}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}
