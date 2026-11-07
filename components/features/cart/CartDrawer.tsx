"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QuantityStepper } from "@/components/features/cart/QuantityStepper";
import { primaryButtonClass } from "@/components/ui/SubmitButton";
import { useCurrency } from "@/hooks/useCurrency";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useCartStore } from "@/lib/shop/cartStore";
import { lineTotal, sumMoney } from "@/lib/shop/money";
import { cn, formatPrice } from "@/lib/utils";

/** The basket preview that slides in from the navbar. */
export function CartDrawer() {
  const mounted = useHasMounted();
  const pathname = usePathname();
  const { lines, drawerOpen, setDrawerOpen, setQuantity, remove } = useCartStore();
  const { code, convert } = useCurrency();
  const open = mounted && drawerOpen;

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname, setDrawerOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setDrawerOpen]);

  const subtotal = sumMoney(lines.map((line) => lineTotal(convert(line.unitPriceLkr), line.quantity)));

  return (
    <div className={cn("fixed inset-0 z-[60] overflow-hidden", !open && "pointer-events-none")} aria-hidden={!open}>
      <div
        onClick={() => setDrawerOpen(false)}
        className={cn("absolute inset-0 bg-charcoal/40 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
      />
      <aside
        role="dialog"
        aria-label="Your cart"
        inert={!open}
        className={cn(
          "absolute top-0 right-0 h-full w-full max-w-sm bg-warm-white shadow-xl flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-heading text-lg font-bold text-charcoal">Your cart</h2>
          <button type="button" aria-label="Close cart" onClick={() => setDrawerOpen(false)} className="p-1 text-charcoal hover:text-forest">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <p className="flex-1 px-5 py-10 text-sm text-muted text-center">Your cart is empty.</p>
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-border px-5">
            {lines.map((line) => (
              <li key={`${line.productId}:${line.variantId ?? ""}`} className="flex gap-3 py-4">
                <div className="relative w-16 h-20 shrink-0 bg-cream rounded overflow-hidden">
                  {line.image && <Image src={line.image} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal line-clamp-2">{line.name}</p>
                  {line.sizeLabel && <p className="text-xs text-muted">{line.sizeLabel}</p>}
                  <p className="text-sm font-bold text-charcoal mt-1 mb-2">
                    {formatPrice(code, lineTotal(convert(line.unitPriceLkr), line.quantity))}
                  </p>
                  <div className="flex items-center justify-between">
                    <QuantityStepper
                      name={line.name}
                      quantity={line.quantity}
                      onChange={(quantity) => setQuantity(line.productId, line.variantId, quantity)}
                    />
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
        )}

        {lines.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm font-bold text-charcoal">
              <span>Subtotal</span>
              <span>{formatPrice(code, subtotal)}</span>
            </div>
            <p className="text-xs text-muted">Shipping is worked out at checkout.</p>
            <Link href="/checkout" className={cn(primaryButtonClass, "w-full")}>
              Checkout
            </Link>
            <Link href="/cart" className="block text-center text-xs text-forest underline underline-offset-2">
              View cart
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
