import type { TaskConfig } from "payload";
import type { OrderContext } from "../../collections/Orders";

const context: OrderContext = {
  systemStatusChange: true,
  statusNote: "Not paid in time, so the items went back in stock.",
};

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

    for (const order of docs) {
      await req.payload.update({
        collection: "orders",
        id: order.id,
        overrideAccess: true,
        req,
        context: { ...context },
        data: { status: "cancelled" },
      });
    }
    return { output: {} };
  },
};
