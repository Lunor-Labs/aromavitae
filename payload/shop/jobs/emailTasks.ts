import type { TaskConfig } from "payload";
import { escapeHtml, orderSummary } from "../email/templates";
import { orderLink, sendOrderEmail, sendSetPasswordEmail, sendStaffAlert, type OrderEmailKind } from "../email/send";
import { formatPrice } from "../../../lib/utils";

/**
 * Emails go through the job queue so a mail server outage can't fail an order or
 * lose an email: a failed send is retried, and the record stays in the job list.
 */
const RETRIES = 4;

export const sendOrderEmailTask: TaskConfig = {
  slug: "sendOrderEmail",
  retries: RETRIES,
  inputSchema: [
    { name: "orderId", type: "number", required: true },
    { name: "kind", type: "text", required: true },
  ],
  handler: async ({ input, req }) => {
    const { orderId, kind } = input as { orderId: number; kind: OrderEmailKind };
    const order = await req.payload.findByID({ collection: "orders", id: orderId, depth: 0, overrideAccess: true, req });
    await sendOrderEmail(req, order, kind);
    return { output: {} };
  },
};

export const sendNewOrderAlertTask: TaskConfig = {
  slug: "sendNewOrderAlert",
  retries: RETRIES,
  inputSchema: [{ name: "orderId", type: "number", required: true }],
  handler: async ({ input, req }) => {
    const { orderId } = input as { orderId: number };
    const order = await req.payload.findByID({ collection: "orders", id: orderId, depth: 0, overrideAccess: true, req });
    const test = order.isTest ? "[TEST] " : "";
    await sendStaffAlert(
      req,
      `${test}New order ${order.orderNumber}: ${formatPrice(order.currency, order.total)}`,
      `New order ${order.orderNumber}`,
      `<p>Paid by ${escapeHtml(order.email)}. <a href="${escapeHtml(orderLink(order))}">Customer's order page</a></p>${orderSummary(order)}`
    );
    return { output: {} };
  },
};

export const sendSetPasswordTask: TaskConfig = {
  slug: "sendSetPasswordEmail",
  retries: RETRIES,
  inputSchema: [{ name: "email", type: "email", required: true }],
  handler: async ({ input, req }) => {
    await sendSetPasswordEmail(req, (input as { email: string }).email);
    return { output: {} };
  },
};
