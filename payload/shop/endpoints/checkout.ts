import { randomBytes } from "node:crypto";
import { commitTransaction, initTransaction, killTransaction, type Endpoint, type PayloadRequest } from "payload";
import { z } from "zod";
import { crossedLowStock, type LowStockItem } from "../../../lib/shop/lowStock";
import { PAYMENT_WINDOW_MINUTES } from "../../../lib/shop/orderStatus";
import type { CheckoutResult } from "../../../lib/shop/orderView";
import { sumMoney } from "../../../lib/shop/money";
import { cartItemSchema, type Quote, type QuoteShippingOption } from "../../../lib/shop/pricing";
import { addressSchema, emailSchema, firstIssue } from "../../../lib/shop/schemas";
import { getShopAccess } from "../access";
import { customerId, fail, readJson, shopClosed } from "../http";
import { payHereConfig, payHereForm } from "../payhere";
import { queueLowStockAlert } from "../jobs/lowStockAlert";
import { loadQuote } from "../quote";
import { takeStock } from "../stock";

const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Your cart is empty.").max(50),
  currency: z.string().max(3),
  email: emailSchema.optional(),
  address: addressSchema,
  shippingMethodId: z.string().min(1, "Choose a shipping method.").max(64),
  notes: z.string().trim().max(500).optional().default(""),
});

/** Thrown to abandon the order and everything done so far, with a message for the customer. */
class CheckoutProblem extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

async function createOrder(
  req: PayloadRequest,
  input: z.infer<typeof checkoutSchema>,
  email: string,
  isTest: boolean,
  quote: Quote,
  shipping: QuoteShippingOption
) {
  const created = await req.payload.create({
    collection: "orders",
    overrideAccess: true,
    req,
    data: {
      // Replaced below, once the order has the id its number comes from.
      orderNumber: `new-${randomBytes(8).toString("hex")}`,
      publicToken: randomBytes(24).toString("base64url"),
      status: "pending_payment",
      isTest,
      email,
      customer: customerId(req),
      customerNotes: input.notes,
      shippingAddress: input.address,
      shippingMethod: shipping.name,
      shippingEstimate: shipping.estimate,
      currency: quote.currency,
      exchangeRate: quote.rate,
      subtotal: quote.subtotal,
      subtotalLkr: quote.subtotalLkr,
      shippingAmount: shipping.price,
      shippingLkr: shipping.priceLkr,
      total: sumMoney([quote.subtotal, shipping.price]),
      totalLkr: quote.subtotalLkr + shipping.priceLkr,
      attempts: 1,
      stockHeld: true,
      expiresAt: new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60_000).toISOString(),
      items: quote.lines.map((line) => ({
        name: line.name,
        sizeLabel: line.sizeLabel,
        image: line.image,
        productId: line.productId,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        unitPriceLkr: line.unitPriceLkr,
        lineTotal: line.lineTotal,
      })),
    },
  });

  return req.payload.update({
    collection: "orders",
    id: created.id,
    overrideAccess: true,
    req,
    data: { orderNumber: `AV-${String(created.id).padStart(6, "0")}` },
  });
}

/**
 * Places an order and returns the form that sends the browser to PayHere.
 * Prices come from the CMS, never the browser. The stock and the order are one
 * transaction: if anything is missing, nothing changes.
 */
export const checkoutEndpoint: Endpoint = {
  path: "/shop/checkout",
  method: "post",
  handler: async (req) => {
    const access = await getShopAccess(req);
    if (!access.open) return shopClosed();
    const isTest = access.mode === "test";

    const parsed = checkoutSchema.safeParse(await readJson(req));
    if (!parsed.success) return fail(400, firstIssue(parsed.error));
    const input = parsed.data;

    const email = req.user?.collection === "customers" ? req.user.email : input.email;
    if (!email) return fail(400, "Enter your email address.");

    const payhere = payHereConfig(isTest);
    if (!payhere) return fail(503, "Online payments aren't available right now. Please contact us.");

    const shouldCommit = await initTransaction(req);
    try {
      const { quote, maxOrderLkr, lowStockLevel } = await loadQuote(req, {
        items: input.items,
        currency: input.currency,
        country: input.address.country,
      });

      const problem = quote.lines.find((line) => line.problem);
      if (problem) throw new CheckoutProblem(409, `${problem.name}: ${problem.problem}. Please check your cart.`);

      const shipping = quote.shipping?.find((option) => option.id === input.shippingMethodId);
      if (!shipping) throw new CheckoutProblem(409, "That shipping method isn't available. Please choose another.");

      if (maxOrderLkr != null && quote.subtotalLkr + shipping.priceLkr > maxOrderLkr) {
        throw new CheckoutProblem(400, "This order is larger than we can take online. Please contact us and we'll help.");
      }

      const lowStock: LowStockItem[] = [];
      for (const line of quote.lines) {
        const taken = await takeStock(req, line);
        if (!taken) throw new CheckoutProblem(409, `${line.name} has just sold out. Please check your cart.`);

        const level = lowStockLevel(line.productId);
        if (taken.remaining != null && crossedLowStock(taken.remaining + line.quantity, taken.remaining, level)) {
          lowStock.push({ productId: line.productId, name: line.name, sizeLabel: line.sizeLabel, stock: taken.remaining, level });
        }
      }

      const order = await createOrder(req, input, email, isTest, quote, shipping);
      await queueLowStockAlert(req, lowStock);
      if (shouldCommit) await commitTransaction(req);

      const result: CheckoutResult = { token: order.publicToken, payhere: payHereForm(payhere, order) };
      return Response.json(result, { status: 201 });
    } catch (error) {
      await killTransaction(req);
      if (error instanceof CheckoutProblem) return fail(error.status, error.message);
      req.payload.logger.error({ err: error }, "Checkout failed");
      return fail(500, "We couldn't place your order. You haven't been charged. Please try again.");
    }
  },
};
