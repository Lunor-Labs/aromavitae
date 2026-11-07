import { createHash, timingSafeEqual } from "node:crypto";
import type { Order } from "../payload-types";
import { countryName } from "../../lib/shop/countries";
import type { PayHereForm } from "../../lib/shop/orderView";
import { serverUrl, siteUrl } from "./http";

/**
 * PayHere's hosted checkout. The browser posts a signed form to PayHere, and
 * PayHere reports the result to the notify endpoint, server to server. The
 * merchant secret stays on the CMS. Both formulas are from PayHere's Checkout API docs.
 */

const LIVE_URL = "https://www.payhere.lk/pay/checkout";
const SANDBOX_URL = "https://sandbox.payhere.lk/pay/checkout";

export interface PayHereConfig {
  merchantId: string;
  merchantSecret: string;
  action: string;
}

/** Test orders use the sandbox account, whatever mode the shop is in now. */
export function payHereConfig(isTest: boolean): PayHereConfig | null {
  const merchantId = isTest ? process.env.PAYHERE_SANDBOX_MERCHANT_ID : process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = isTest ? process.env.PAYHERE_SANDBOX_MERCHANT_SECRET : process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantId || !merchantSecret) return null;
  return { merchantId, merchantSecret, action: isTest ? SANDBOX_URL : LIVE_URL };
}

const md5Upper = (input: string) => createHash("md5").update(input).digest("hex").toUpperCase();

/** PayHere always wants two decimal places. */
export const formatAmount = (amount: number) => amount.toFixed(2);

export function checkoutHash(config: PayHereConfig, orderId: string, amount: string, currency: string): string {
  return md5Upper(`${config.merchantId}${orderId}${amount}${currency}${md5Upper(config.merchantSecret)}`);
}

export interface NotifyParams {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  statusCode: string;
  signature: string;
}

export function notifySignature(config: PayHereConfig, params: Omit<NotifyParams, "signature">): string {
  return md5Upper(
    `${params.merchantId}${params.orderId}${params.amount}${params.currency}${params.statusCode}${md5Upper(config.merchantSecret)}`
  );
}

export function isGenuineNotify(config: PayHereConfig, params: NotifyParams): boolean {
  if (params.merchantId !== config.merchantId) return false;
  const expected = Buffer.from(notifySignature(config, params));
  const given = Buffer.from(params.signature.toUpperCase());
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Whether what PayHere took is exactly what this order costs. */
export function matchesOrder(order: Pick<Order, "total" | "currency">, amount: string, currency: string): boolean {
  return currency === order.currency && Math.round(Number(amount) * 100) === Math.round(order.total * 100);
}

export function payHereForm(config: PayHereConfig, order: Order): PayHereForm {
  const amount = formatAmount(order.total);
  const { fullName, phone, line1, line2, city, country } = order.shippingAddress;
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  const items = order.items ?? [];

  return {
    action: config.action,
    fields: {
      merchant_id: config.merchantId,
      return_url: `${siteUrl()}/checkout/success/${order.publicToken}`,
      cancel_url: `${siteUrl()}/checkout/failed/${order.publicToken}`,
      notify_url: `${serverUrl()}/api/shop/payhere/notify`,
      order_id: order.orderNumber,
      items: items.length === 1 ? items[0].name : `${items.length} items`,
      currency: order.currency,
      amount,
      hash: checkoutHash(config, order.orderNumber, amount, order.currency),
      first_name: firstName,
      last_name: rest.join(" ") || firstName,
      email: order.email,
      phone,
      address: [line1, line2].filter(Boolean).join(", "),
      city,
      country: countryName(country),
    },
  };
}
