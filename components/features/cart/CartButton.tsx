"use client";

import { useHasMounted } from "@/hooks/useHasMounted";
import { selectItemCount, useCartStore } from "@/lib/shop/cartStore";

export function CartButton() {
  const mounted = useHasMounted();
  const count = useCartStore(selectItemCount);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const shown = mounted ? count : 0;

  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      aria-label={shown > 0 ? `Cart, ${shown} item${shown === 1 ? "" : "s"}` : "Cart"}
      className="relative p-1 text-charcoal hover:text-forest transition-colors duration-200"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {shown > 0 && (
        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gold text-[10px] font-bold text-warm-white flex items-center justify-center">
          {shown}
        </span>
      )}
    </button>
  );
}
