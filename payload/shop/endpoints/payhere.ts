import { commitTransaction, initTransaction, killTransaction, type Endpoint, type PayloadRequest } from "payload";
import { z } from "zod";
import { holdsStock, type OrderContext } from "../../collections/Orders";
import type { Order } from "../../payload-types";
import { isPaidStatus, type OrderStatus } from "../../../lib/shop/orderStatus";
import type { PayHereForm } from "../../../lib/shop/orderView";
import { getShopAccess } from "../access";
import { DUPLICATE_WINDOW_MINUTES, addNote, sameItems } from "../attention";
import { attachGuestAccount } from "../guestAccount";
import { fail, readJson, shopClosed } from "../http";
import { canRetry } from "../orderView";
import { isGenuineNotify, matchesOrder, payHereConfig, payHereForm } from "../payhere";
import { lockOrder, takeStock } from "../stock";

/** PayHere's status codes, from its Checkout API docs. */
const PAID = "2";
const PENDING = "0";
const CANCELLED = "-1";
const FAILED = "-2";
const CHARGED_BACK = "-3";

/** Another go at paying for an order. Having the order's private token is what allows it. */
export const startPaymentEndpoint: Endpoint = {
  path: "/shop/payhere/start",
  method: "post",
  handler: async (req) => {
    if (!(await getShopAccess(req)).open) return shopClosed();

    const parsed = z.object({ token: z.string().min(1).max(64) }).safeParse(await readJson(req));
    if (!parsed.success) return fail(400, "That link isn't valid.");

    const { docs } = await req.payload.find({
      collection: "orders",
      where: { publicToken: { equals: parsed.data.token } },
      limit: 1,
      overrideAccess: true,
    });
    const order = docs[0];
    if (!order) return fail(404, "We couldn't find that order.");
    if (!canRetry(order)) return fail(409, "This order can't be paid for any more. Please contact us.");

    const config = payHereConfig(Boolean(order.isTest));
    if (!config) return fail(503, "Online payments aren't available right now. Please contact us.");

    await req.payload.update({
      collection: "orders",
      id: order.id,
      overrideAccess: true,
      data: { attempts: (order.attempts ?? 0) + 1 },
    });

    const form: PayHereForm = payHereForm(config, order);
    return Response.json(form);
  },
};

/**
 * Another paid order from the same email, for exactly the same things, in the
 * last hour: most likely the customer went back from PayHere and ordered again.
 */
async function findDuplicate(req: PayloadRequest, order: Order): Promise<string | null> {
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60_000).toISOString();
  const { docs } = await req.payload.find({
    collection: "orders",
    where: {
      and: [{ email: { equals: order.email } }, { id: { not_equals: order.id } }, { paidAt: { greater_than: since } }],
    },
    limit: 10,
    depth: 0,
    overrideAccess: true,
    req,
  });
  return docs.find((other) => sameItems(other.items ?? [], order.items ?? []))?.orderNumber ?? null;
}

/** What a genuine PayHere report does to the order. Null status means it stays as it is. */
async function applyReport(req: PayloadRequest, order: Order, code: string, amount: string, currency: string, paymentId: string) {
  const update: Partial<Order> = {};
  const context: OrderContext = { systemStatusChange: true };
  const alreadyPaid = isPaidStatus(order.status as OrderStatus) || Boolean(order.paidAt);
  const flag = (note: string) => {
    update.needsAttention = addNote(update.needsAttention ?? order.needsAttention, note);
  };

  if (code === PAID && alreadyPaid) {
    // The same report again changes nothing. A different payment means they were charged twice.
    if (paymentId && paymentId !== order.paymentId) {
      flag(`Paid twice: PayHere payments ${order.paymentId ?? "(unknown)"} and ${paymentId}. Refund one in the PayHere dashboard.`);
    }
  } else if (code === PAID) {
    if (!matchesOrder(order, amount, currency)) {
      flag(`PayHere took ${currency} ${amount}, but this order costs ${order.currency} ${order.total}. It has not been marked paid.`);
    } else {
      update.status = "processing";
      update.paidAt = new Date().toISOString();
      update.paymentId = paymentId;

      // The payment arrived after the order expired and gave its stock back.
      if (!order.stockHeld) {
        context.statusNote = "Payment arrived after the order had expired.";
        const items: NonNullable<Order["items"]> = [];
        for (const item of order.items ?? []) {
          const taken = await takeStock(req, { productId: item.productId, variantId: item.variantId, quantity: item.quantity });
          items.push({ ...item, stockTaken: Boolean(taken) });
        }
        // Recorded per line, so cancelling or refunding later only returns what was taken.
        update.items = items;
        update.stockHeld = true;
        if (!items.every(holdsStock)) {
          flag("Paid after the order expired, and some items had sold out in the meantime. Please contact the customer.");
        }
      }

      const duplicate = await findDuplicate(req, order);
      if (duplicate) {
        flag(
          `Possibly ordered twice: ${duplicate} was paid from the same email for the same items in the last hour. Check with the customer, and refund one if so.`
        );
      }
    }
  } else if ((code === FAILED || code === CANCELLED) && order.status === "pending_payment" && !canRetry(order)) {
    // Out of attempts. Otherwise the order waits, still holding stock, in case they try again.
    update.status = "failed";
    context.statusNote = "The last payment attempt didn't go through.";
  } else if (code === CHARGED_BACK) {
    flag("PayHere reported a chargeback on this order. Check the PayHere dashboard.");
  }

  return { update, context };
}

/** PayHere reporting a payment, server to server. This is the only thing that marks an order paid. */
export const notifyEndpoint: Endpoint = {
  path: "/shop/payhere/notify",
  method: "post",
  handler: async (req) => {
    const body = new URLSearchParams((await req.text?.()) ?? "");
    const value = (name: string) => body.get(name) ?? "";
    const orderId = value("order_id");
    const code = value("status_code");
    const amount = value("payhere_amount");
    const currency = value("payhere_currency");
    const paymentId = value("payment_id");

    const { docs } = await req.payload.find({
      collection: "orders",
      where: { orderNumber: { equals: orderId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const found = docs[0];
    if (!found) return fail(404, "Unknown order.");

    const config = payHereConfig(Boolean(found.isTest));
    if (!config) return fail(503, "Payments aren't configured.");

    const genuine = isGenuineNotify(config, {
      merchantId: value("merchant_id"),
      orderId,
      amount,
      currency,
      statusCode: code,
      signature: value("md5sig"),
    });
    if (!genuine) {
      req.payload.logger.warn({ orderId }, "Rejected a PayHere notification with a bad signature");
      return fail(400, "Invalid signature.");
    }
    if (![PAID, PENDING, CANCELLED, FAILED, CHARGED_BACK].includes(code)) return fail(400, "Unknown status.");

    const shouldCommit = await initTransaction(req);
    let paidNow: Order | null = null;
    try {
      await lockOrder(req, found.id);
      const order = await req.payload.findByID({ collection: "orders", id: found.id, depth: 0, overrideAccess: true, req });
      const { update, context } = await applyReport(req, order, code, amount, currency, paymentId);

      const saved = await req.payload.update({
        collection: "orders",
        id: order.id,
        overrideAccess: true,
        req,
        context: { ...context },
        data: {
          ...update,
          paymentLog: [
            ...(order.paymentLog ?? []),
            {
              at: new Date().toISOString(),
              statusCode: code,
              amount: `${currency} ${amount}`,
              method: value("method"),
              paymentId,
              message: value("status_message"),
            },
          ],
        },
      });
      if (shouldCommit) await commitTransaction(req);
      if (update.status === "processing") paidNow = saved;
    } catch (error) {
      await killTransaction(req);
      req.payload.logger.error({ err: error, orderId }, "Couldn't apply a PayHere notification");
      return fail(500, "Couldn't record that. Please retry.");
    }

    // Separate from the payment: a problem here must not undo or repeat it.
    if (paidNow) {
      await attachGuestAccount(req, paidNow).catch((error: unknown) => {
        req.payload.logger.error({ err: error, orderId }, "Couldn't set up a guest account");
      });
    }
    return new Response("OK");
  },
};
