"use client";

import type { Quote } from "@/lib/shop/pricing";
import { cn, formatPrice } from "@/lib/utils";

interface ShippingChooserProps {
  quote: Quote;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ShippingChooser({ quote, selectedId, onSelect }: ShippingChooserProps) {
  if (quote.shipping?.length === 0) {
    return <p className="text-sm text-red-800">We can&apos;t ship this order to that country yet. Please contact us and we&apos;ll help.</p>;
  }

  return (
    <div className="space-y-3">
      {quote.shipping?.map((option) => (
        <label
          key={option.id}
          className={cn(
            "flex items-center gap-3 border rounded-lg p-4 text-sm cursor-pointer transition-colors duration-200",
            selectedId === option.id ? "border-forest bg-forest/5" : "border-border hover:border-forest/40"
          )}
        >
          <input type="radio" name="shipping" checked={selectedId === option.id} onChange={() => onSelect(option.id)} />
          <span className="flex-1">
            <span className="block font-medium text-charcoal">{option.name}</span>
            {option.estimate && <span className="text-xs text-muted">{option.estimate}</span>}
          </span>
          <span className="font-medium text-charcoal shrink-0">
            {option.price === 0 ? "Free" : formatPrice(quote.currency, option.price)}
          </span>
        </label>
      ))}
    </div>
  );
}
