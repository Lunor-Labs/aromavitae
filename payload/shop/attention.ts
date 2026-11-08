import type { Order } from "../payload-types";

/**
 * "Needs attention" is one text box that collects every problem on an order, so
 * a later one never hides an earlier one. A note already there isn't repeated.
 */
export function addNote(existing: string | null | undefined, note: string): string {
  if (!existing) return note;
  return existing.split("\n").includes(note) ? existing : `${existing}\n${note}`;
}

type Items = Pick<NonNullable<Order["items"]>[number], "productId" | "variantId" | "quantity">[];

const itemsKey = (items: Items) =>
  items
    .map((item) => `${item.productId}:${item.variantId ?? ""}:${item.quantity}`)
    .sort()
    .join("|");

/** The same things in the same quantities, in any order. */
export const sameItems = (a: Items, b: Items) => itemsKey(a) === itemsKey(b);

/** How far back a paid order with the same email and items looks like a second go at the same purchase. */
export const DUPLICATE_WINDOW_MINUTES = 60;
