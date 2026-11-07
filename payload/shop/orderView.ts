import type { Order } from "../payload-types";
import { MAX_PAYMENT_ATTEMPTS, canRetryPayment, isPaidStatus, type OrderStatus } from "../../lib/shop/orderStatus";
import type { OrderView } from "../../lib/shop/orderView";

export function canRetry(order: Order): boolean {
  return canRetryPayment({
    status: order.status as OrderStatus,
    attempts: order.attempts ?? 0,
    stockHeld: Boolean(order.stockHeld),
    expiresAt: order.expiresAt ?? new Date(0).toISOString(),
  });
}

export function toOrderView(order: Order): OrderView {
  const address = order.shippingAddress;
  const { carrier, number, url } = order.tracking ?? {};
  return {
    token: order.publicToken,
    orderNumber: order.orderNumber,
    status: order.status as OrderStatus,
    isPaid: isPaidStatus(order.status as OrderStatus),
    canRetry: canRetry(order),
    attemptsLeft: Math.max(0, MAX_PAYMENT_ATTEMPTS - (order.attempts ?? 0)),
    createdAt: order.createdAt,
    email: order.email,
    notes: order.customerNotes ?? "",
    address: {
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      region: address.region ?? "",
      postalCode: address.postalCode ?? "",
      country: address.country,
    },
    lines: (order.items ?? []).map((item) => ({
      name: item.name,
      sizeLabel: item.sizeLabel ?? null,
      image: item.image ?? null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    currency: order.currency,
    subtotal: order.subtotal,
    shippingMethod: order.shippingMethod,
    shippingEstimate: order.shippingEstimate ?? null,
    shippingAmount: order.shippingAmount,
    total: order.total,
    tracking: carrier || number || url ? { carrier: carrier ?? null, number: number ?? null, url: url ?? null } : null,
  };
}
