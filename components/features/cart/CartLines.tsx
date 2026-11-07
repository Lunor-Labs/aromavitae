"use client";

import Image from "next/image";
import { QuantityStepper } from "@/components/features/cart/QuantityStepper";
import { useCartStore } from "@/lib/shop/cartStore";
import type { Quote } from "@/lib/shop/pricing";
import { formatPrice } from "@/lib/utils";

/** The basket with live prices and stock. Anything that can't be bought says why. */
export function CartLines({ quote }: { quote: Quote }) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);

  return (
    <ul className="divide-y divide-border border-y border-border">
      {quote.lines.map((line) => (
        <li key={`${line.productId}:${line.variantId ?? ""}`} className="flex gap-4 py-5">
          <div className="relative w-20 h-24 shrink-0 bg-cream rounded overflow-hidden">
            {line.image && <Image src={line.image} alt="" fill sizes="80px" className="object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap justify-between gap-x-4">
              <p className="text-sm font-medium text-charcoal">{line.name}</p>
              {!line.problem && (
                <p className="text-sm font-bold text-charcoal">{formatPrice(quote.currency, line.lineTotal)}</p>
              )}
            </div>
            {line.sizeLabel && <p className="text-xs text-muted">{line.sizeLabel}</p>}
            {!line.problem && (
              <p className="text-xs text-muted mb-3">{formatPrice(quote.currency, line.unitPrice)} each</p>
            )}
            {line.problem && <p className="text-xs font-medium text-red-800 mt-1 mb-3">{line.problem}</p>}
            <div className="flex items-center gap-4">
              {line.available !== 0 && (
                <QuantityStepper
                  name={line.name}
                  quantity={line.quantity}
                  available={line.available}
                  onChange={(quantity) => setQuantity(line.productId, line.variantId, quantity)}
                />
              )}
              <button
                type="button"
                onClick={() => remove(line.productId, line.variantId)}
                className="text-xs text-muted underline underline-offset-2 hover:text-forest"
              >
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
