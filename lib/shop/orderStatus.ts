/** An order's life, shared by the CMS and the storefront. */

export const ORDER_STATUSES = [
  "pending_payment",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Waiting for payment",
  processing: "Paid, being prepared",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Payment failed",
  refunded: "Refunded",
};

/** The changes staff can make, so an order can't jump from unpaid straight to shipped. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["processing", "cancelled", "failed"],
  processing: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  failed: ["cancelled"],
  cancelled: [],
  refunded: [],
};

export const canChangeStatus = (from: OrderStatus, to: OrderStatus) => TRANSITIONS[from].includes(to);

/**
 * Whether this change puts the order's items back in stock. A refund after
 * shipping doesn't: the goods have left, and staff adjust stock if they return.
 */
export function releasesStock(from: OrderStatus, to: OrderStatus): boolean {
  if (to === "cancelled" || to === "failed") return true;
  return to === "refunded" && (from === "processing" || from === "pending_payment");
}

export const isPaidStatus = (status: OrderStatus) =>
  status === "processing" || status === "shipped" || status === "delivered";

/** How many times a customer can start paying for one order. */
export const MAX_PAYMENT_ATTEMPTS = 3;

/** How long an unpaid order holds its stock. */
export const PAYMENT_WINDOW_MINUTES = 60;

/** How many orders one email can have waiting for payment, each holding stock, at once. */
export const MAX_UNPAID_ORDERS_PER_EMAIL = 3;

interface RetryCheck {
  status: OrderStatus;
  attempts: number;
  stockHeld: boolean;
  expiresAt: string;
}

export function canRetryPayment(order: RetryCheck, now: Date = new Date()): boolean {
  return (
    order.status === "pending_payment" &&
    order.attempts < MAX_PAYMENT_ATTEMPTS &&
    order.stockHeld &&
    new Date(order.expiresAt) > now
  );
}
