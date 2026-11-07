import type { Endpoint } from "payload";
import { customerId, fail } from "../http";
import { toOrderView } from "../orderView";

/** One order, for whoever has its private link: the guest's way in, and every email's. */
export const orderByTokenEndpoint: Endpoint = {
  path: "/shop/orders/:token",
  method: "get",
  handler: async (req) => {
    const token = String(req.routeParams?.token ?? "");
    const { docs } = await req.payload.find({
      collection: "orders",
      where: { publicToken: { equals: token } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const order = docs[0];
    if (!order) return fail(404, "We couldn't find that order.");
    return Response.json(toOrderView(order));
  },
};

/** The logged-in customer's own orders. */
export const myOrdersEndpoint: Endpoint = {
  path: "/shop/orders",
  method: "get",
  handler: async (req) => {
    const id = customerId(req);
    if (id == null) return fail(401, "Please sign in.");

    const { docs } = await req.payload.find({
      collection: "orders",
      where: { customer: { equals: id } },
      sort: "-createdAt",
      limit: 100,
      depth: 0,
      overrideAccess: true,
    });
    return Response.json(docs.map(toOrderView));
  },
};
