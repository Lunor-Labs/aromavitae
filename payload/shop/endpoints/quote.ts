import type { Endpoint } from "payload";
import { z } from "zod";
import { cartItemSchema } from "../../../lib/shop/pricing";
import { isCountryCode } from "../../../lib/shop/countries";
import { getShopAccess } from "../access";
import { fail, readJson, shopClosed } from "../http";
import { loadQuote } from "../quote";

const quoteSchema = z.object({
  items: z.array(cartItemSchema).max(50),
  currency: z.string().max(3).nullish(),
  country: z.string().refine(isCountryCode).nullish(),
});

/** Live prices, stock and shipping for a basket. The cart and checkout pages both show this. */
export const quoteEndpoint: Endpoint = {
  path: "/shop/quote",
  method: "post",
  handler: async (req) => {
    if (!(await getShopAccess(req)).open) return shopClosed();

    const parsed = quoteSchema.safeParse(await readJson(req));
    if (!parsed.success) return fail(400, "That basket isn't valid.");

    const { quote } = await loadQuote(req, parsed.data);
    return Response.json(quote);
  },
};
