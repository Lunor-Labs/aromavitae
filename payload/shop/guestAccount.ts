import { randomBytes } from "node:crypto";
import type { PayloadRequest } from "payload";
import type { Order } from "../payload-types";

/**
 * Gives a guest an account after a successful payment, so they can track this
 * order and buy faster next time. Nobody can log in until the real owner of the
 * email sets a password.
 *
 * An email that already has an account is left alone. Anyone can type someone
 * else's email at checkout, so the order is not added to that account's history:
 * the customer tracks it through the private link instead.
 *
 * The set-password email is queued, so it goes out with retries like the rest.
 */
export async function attachGuestAccount(req: PayloadRequest, order: Order): Promise<void> {
  if (order.customer) return;

  const { payload } = req;
  const { totalDocs } = await payload.count({
    collection: "customers",
    where: { email: { equals: order.email } },
    overrideAccess: true,
  });
  if (totalDocs > 0) return;

  const customer = await payload.create({
    collection: "customers",
    overrideAccess: true,
    data: {
      email: order.email,
      password: randomBytes(32).toString("base64url"),
      name: order.shippingAddress.fullName,
      phone: order.shippingAddress.phone,
      addresses: [
        {
          isDefault: true,
          fullName: order.shippingAddress.fullName,
          phone: order.shippingAddress.phone,
          line1: order.shippingAddress.line1,
          line2: order.shippingAddress.line2,
          city: order.shippingAddress.city,
          region: order.shippingAddress.region,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        },
      ],
    },
  });

  await payload.update({
    collection: "orders",
    id: order.id,
    overrideAccess: true,
    data: { customer: customer.id },
  });
  await payload.jobs.queue({ task: "sendSetPasswordEmail", queue: "shop", input: { email: order.email } });
}
