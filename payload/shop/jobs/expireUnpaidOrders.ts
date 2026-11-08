import { commitTransaction, initTransaction, killTransaction, type PayloadRequest, type TaskConfig } from "payload";
import type { OrderContext } from "../../collections/Orders";
import { lockOrder } from "../stock";

const context: OrderContext = {
  systemStatusChange: true,
  statusNote: "Not paid in time, so the items went back in stock.",
};

/**
 * Cancels one order, if it's still unpaid and out of time. The lock is the one
 * PayHere's report takes, so a payment landing at this moment either goes first
 * (and the order is left alone) or waits and finds it cancelled, which the
 * report handles as a late payment.
 */
async function expire(req: PayloadRequest, id: number) {
  const shouldCommit = await initTransaction(req);
  try {
    await lockOrder(req, id);
    const order = await req.payload.findByID({ collection: "orders", id, depth: 0, overrideAccess: true, req });
    const stillDue = order.status === "pending_payment" && order.expiresAt && new Date(order.expiresAt) < new Date();
    if (stillDue) {
      await req.payload.update({
        collection: "orders",
        id,
        overrideAccess: true,
        req,
        context: { ...context },
        data: { status: "cancelled" },
      });
    }
    if (shouldCommit) await commitTransaction(req);
  } catch (error) {
    await killTransaction(req);
    req.payload.logger.error({ err: error, orderId: id }, "Couldn't expire an unpaid order");
  }
}

/** Cancelling an order puts its stock back (see `handleStatusChange` in collections/Orders.ts). */
export const expireUnpaidOrders: TaskConfig = {
  slug: "expireUnpaidOrders",
  schedule: [{ cron: "*/5 * * * *", queue: "shop" }],
  handler: async ({ req }) => {
    const { docs } = await req.payload.find({
      collection: "orders",
      where: {
        and: [{ status: { equals: "pending_payment" } }, { expiresAt: { less_than: new Date().toISOString() } }],
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
      req,
    });

    for (const order of docs) await expire(req, order.id);
    return { output: {} };
  },
};
