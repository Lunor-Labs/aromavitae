"use client";

import { useState } from "react";
import Link from "next/link";
import { CartLines } from "@/components/features/cart/CartLines";
import { CountrySelect } from "@/components/features/cart/CountrySelect";
import { FormMessage } from "@/components/ui/FormMessage";
import { primaryButtonClass } from "@/components/ui/SubmitButton";
import { useBrowserCookie } from "@/hooks/useBrowserCookie";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useQuote } from "@/hooks/useQuote";
import { useCartStore } from "@/lib/shop/cartStore";
import { COUNTRY_COOKIE } from "@/lib/shop/money";
import { HOME_COUNTRY, isCountryCode } from "@/lib/shop/countries";
import { cn, formatPrice } from "@/lib/utils";

/** The cart page: live prices, plus what shipping would cost to a chosen country. */
export function CartContent() {
  const mounted = useHasMounted();
  const count = useCartStore((state) => state.lines.length);
  const visitorCountry = useBrowserCookie(COUNTRY_COOKIE);
  const [picked, setPicked] = useState<string | null>(null);
  const country = picked ?? (visitorCountry && isCountryCode(visitorCountry) ? visitorCountry : HOME_COUNTRY);
  const { quote, loading, error } = useQuote(country);

  if (!mounted) return <p className="text-sm text-muted">Loading your cart…</p>;

  if (count === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-muted mb-6">Your cart is empty.</p>
        <Link href="/products" className={primaryButtonClass}>
          Browse products
        </Link>
      </div>
    );
  }

  if (!quote) return error ? <FormMessage error={error} /> : <p className="text-sm text-muted">Checking prices…</p>;

  const blocked = quote.lines.some((line) => line.problem);

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-10">
      <CartLines quote={quote} />
      <aside className="h-fit bg-cream border border-border rounded-lg p-6 space-y-5">
        <div className="flex justify-between text-sm font-bold text-charcoal">
          <span>Subtotal</span>
          <span>{formatPrice(quote.currency, quote.subtotal)}</span>
        </div>
        <div className="space-y-3">
          <CountrySelect label="Shipping to" value={country} onChange={setPicked} />
          {quote.shipping?.length === 0 && (
            <p className="text-xs text-red-800">We can&apos;t ship this order there yet. Please contact us.</p>
          )}
          <ul className="space-y-1 text-xs text-muted">
            {quote.shipping?.map((option) => (
              <li key={option.id} className="flex justify-between gap-3">
                <span>
                  {option.name}
                  {option.estimate && ` · ${option.estimate}`}
                </span>
                <span className="font-medium text-charcoal shrink-0">
                  {option.price === 0 ? "Free" : formatPrice(quote.currency, option.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <FormMessage error={error ?? undefined} />
        {blocked ? (
          <p className="text-xs text-red-800">Please sort out the items marked in your cart before checking out.</p>
        ) : (
          <Link href="/checkout" className={cn(primaryButtonClass, "w-full", loading && "opacity-60")}>
            Checkout
          </Link>
        )}
      </aside>
    </div>
  );
}
