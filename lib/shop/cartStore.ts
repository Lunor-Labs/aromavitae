"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_QUANTITY, type CartItemInput, type QuoteLine } from "@/lib/shop/pricing";

/**
 * The basket, kept in the browser so it survives reloads and logins. The name,
 * price and picture are only for showing it quickly: the CMS works out the real
 * price from the product and size every time.
 */
export interface CartLine {
  productId: number;
  variantId: string | null;
  name: string;
  sizeLabel: string | null;
  image: string | null;
  unitPriceLkr: number;
  quantity: number;
}

/**
 * The order last placed from this cart, until it's paid. Coming back from
 * PayHere leaves the cart as it was, so without this, pressing pay again would
 * place, and charge, a second order.
 */
export interface PendingOrder {
  token: string;
  orderNumber: string;
  /** The cart it was placed from. Once the cart changes, it's a different purchase. */
  cartKey: string;
}

interface CartState {
  lines: CartLine[];
  drawerOpen: boolean;
  pendingOrder: PendingOrder | null;
  setPendingOrder: (order: PendingOrder | null) => void;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: number, variantId: string | null, quantity: number) => void;
  remove: (productId: number, variantId: string | null) => void;
  clear: () => void;
  setDrawerOpen: (open: boolean) => void;
  /** Bring the shown names and prices up to date with a quote. */
  syncFromQuote: (quoteLines: QuoteLine[]) => void;
}

const same = (line: CartLine, productId: number, variantId: string | null) =>
  line.productId === productId && line.variantId === variantId;

const clamp = (quantity: number) => Math.min(Math.max(quantity, 1), MAX_QUANTITY);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      drawerOpen: false,
      pendingOrder: null,
      setPendingOrder: (pendingOrder) => set({ pendingOrder }),
      add: (line, quantity = 1) =>
        set((state) => {
          const exists = state.lines.some((l) => same(l, line.productId, line.variantId));
          return {
            drawerOpen: true,
            lines: exists
              ? state.lines.map((l) =>
                  same(l, line.productId, line.variantId) ? { ...l, ...line, quantity: clamp(l.quantity + quantity) } : l
                )
              : [...state.lines, { ...line, quantity: clamp(quantity) }],
          };
        }),
      setQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) => (same(l, productId, variantId) ? { ...l, quantity: clamp(quantity) } : l)),
        })),
      remove: (productId, variantId) =>
        set((state) => ({ lines: state.lines.filter((l) => !same(l, productId, variantId)) })),
      clear: () => set({ lines: [], pendingOrder: null }),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      syncFromQuote: (quoteLines) =>
        set((state) => {
          let changed = false;
          const lines = state.lines.map((line) => {
            const fresh = quoteLines.find((q) => same(line, q.productId, q.variantId));
            if (!fresh || fresh.problem === "No longer available") return line;
            if (
              fresh.unitPriceLkr === line.unitPriceLkr &&
              fresh.name === line.name &&
              fresh.sizeLabel === line.sizeLabel &&
              fresh.image === line.image
            ) {
              return line;
            }
            changed = true;
            return {
              ...line,
              unitPriceLkr: fresh.unitPriceLkr,
              name: fresh.name,
              sizeLabel: fresh.sizeLabel,
              image: fresh.image,
            };
          });
          return changed ? { lines } : state;
        }),
    }),
    { name: "av-cart", partialize: (state) => ({ lines: state.lines, pendingOrder: state.pendingOrder }) }
  )
);

export const selectItemCount = (state: { lines: CartLine[] }) =>
  state.lines.reduce((sum, line) => sum + line.quantity, 0);

export const toCartItems = (lines: CartLine[]): CartItemInput[] =>
  lines.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity }));

/** What's in the cart, ignoring the order of lines and the display-only details. */
export const cartKey = (lines: CartLine[]): string =>
  lines
    .map((line) => `${line.productId}:${line.variantId ?? ""}:${line.quantity}`)
    .sort()
    .join("|");
