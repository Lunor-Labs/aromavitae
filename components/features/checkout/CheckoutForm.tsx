"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AddressChooser } from "@/components/features/checkout/AddressChooser";
import { CheckoutSummary } from "@/components/features/checkout/CheckoutSummary";
import { ShippingChooser } from "@/components/features/checkout/ShippingChooser";
import { FormField, inputClass, labelClass } from "@/components/ui/FormField";
import { FormMessage } from "@/components/ui/FormMessage";
import { primaryButtonClass } from "@/components/ui/SubmitButton";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useQuote } from "@/hooks/useQuote";
import { placeOrderAction } from "@/lib/shop/actions/checkout";
import { toCartItems, useCartStore } from "@/lib/shop/cartStore";
import { HOME_COUNTRY, isCountryCode } from "@/lib/shop/countries";
import type { Address, SavedAddress } from "@/lib/shop/schemas";
import { submitPayHereForm } from "@/lib/shop/submitPayHereForm";
import { useBrowserCookie } from "@/hooks/useBrowserCookie";
import { COUNTRY_COOKIE } from "@/lib/shop/money";
import { cn } from "@/lib/utils";

interface CheckoutFormProps {
  customer: { email: string; name: string; phone: string; addresses: SavedAddress[] } | null;
}

const sectionHeading = "font-heading text-lg font-bold text-charcoal mb-4";

export function CheckoutForm({ customer }: CheckoutFormProps) {
  const mounted = useHasMounted();
  const lines = useCartStore((state) => state.lines);
  const saved = customer?.addresses ?? [];
  const defaultIndex = saved.findIndex((a) => a.isDefault);
  const visitorCountry = useBrowserCookie(COUNTRY_COOKIE);

  const [selectedAddress, setSelectedAddress] = useState<number | null>(saved.length ? Math.max(defaultIndex, 0) : null);
  const [edited, setEdited] = useState<Address | null>(null);
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [pickedShipping, setPickedShipping] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form: Address = edited ?? {
    fullName: customer?.name ?? "",
    phone: customer?.phone ?? "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: visitorCountry && isCountryCode(visitorCountry) ? visitorCountry : HOME_COUNTRY,
  };
  const address: Address = selectedAddress === null ? form : saved[selectedAddress];

  const { quote, error: quoteError } = useQuote(address.country);
  const options = quote?.shipping ?? [];
  const shipping = options.find((option) => option.id === pickedShipping) ?? options[0] ?? null;

  if (!mounted) return <p className="text-sm text-muted">Loading checkout…</p>;

  if (lines.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-muted mb-6">Your cart is empty.</p>
        <Link href="/products" className={primaryButtonClass}>
          Browse products
        </Link>
      </div>
    );
  }

  if (!quote) return quoteError ? <FormMessage error={quoteError} /> : <p className="text-sm text-muted">Checking prices…</p>;

  const blocked = quote.lines.some((line) => line.problem) || !shipping;

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipping) return;
    setError(null);
    startTransition(async () => {
      const result = await placeOrderAction({
        items: toCartItems(lines),
        currency: quote.currency,
        email: customer ? undefined : email,
        address,
        shippingMethodId: shipping.id,
        notes,
      });
      if (result.ok) submitPayHereForm(result.data.payhere);
      else setError(result.message);
    });
  };

  return (
    <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_380px] gap-10">
      <div className="space-y-10">
        <section>
          <h2 className={sectionHeading}>Contact</h2>
          {customer ? (
            <p className="text-sm text-muted">Signed in as {customer.email}</p>
          ) : (
            <>
              <FormField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <p className="text-xs text-muted mt-2">
                We&apos;ll email your order here, and set up an account so you can track it.{" "}
                <Link href="/account/login?next=/checkout" className="text-forest underline underline-offset-2">
                  Already have an account? Sign in
                </Link>
              </p>
            </>
          )}
        </section>

        <section>
          <h2 className={sectionHeading}>Ship to</h2>
          <AddressChooser saved={saved} selected={selectedAddress} onSelect={setSelectedAddress} form={form} onFormChange={setEdited} />
        </section>

        <section>
          <h2 className={sectionHeading}>Shipping method</h2>
          <ShippingChooser quote={quote} selectedId={shipping?.id ?? null} onSelect={setPickedShipping} />
        </section>

        <section>
          <label htmlFor="order-notes" className={labelClass}>
            Order notes
          </label>
          <textarea
            id="order-notes"
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
          />
        </section>
      </div>

      <CheckoutSummary quote={quote} shipping={shipping}>
        <FormMessage error={error ?? undefined} />
        <button type="submit" disabled={pending || blocked} className={cn(primaryButtonClass, "w-full mt-3")}>
          {pending ? "Placing order…" : "Pay with PayHere"}
        </button>
        <p className="text-xs text-muted text-center mt-3">
          You&apos;ll pay in {quote.currency} on PayHere&apos;s secure page. We never see your card details.
        </p>
      </CheckoutSummary>
    </form>
  );
}
