"use server";

import { cmsFetch, type CmsResult } from "@/lib/shop/cms";
import type { CheckoutResult, OrderView, PayHereForm } from "@/lib/shop/orderView";
import type { CartItemInput } from "@/lib/shop/pricing";
import type { Address } from "@/lib/shop/schemas";

interface PlaceOrderInput {
  items: CartItemInput[];
  currency: string;
  /** Only for guests: a customer's order uses their account's email. */
  email?: string;
  address: Address;
  shippingMethodId: string;
  notes: string;
  /** Cloudflare Turnstile's proof of a real browser. The CMS checks it. */
  turnstileToken?: string;
}

export async function placeOrderAction(input: PlaceOrderInput): Promise<CmsResult<CheckoutResult>> {
  return cmsFetch<CheckoutResult>("shop/checkout", { method: "POST", body: input });
}

export async function retryPaymentAction(token: string): Promise<CmsResult<PayHereForm>> {
  return cmsFetch<PayHereForm>("shop/payhere/start", { method: "POST", body: { token } });
}

export async function getOrderAction(token: string): Promise<CmsResult<OrderView>> {
  return cmsFetch<OrderView>(`shop/orders/${encodeURIComponent(token)}`);
}
