import type { Endpoint } from "payload";
import { firstIssue, registerSchema } from "../../../lib/shop/schemas";
import { getShopAccess } from "../access";
import { fail, readJson, shopClosed } from "../http";

/** Sign-up, only while the shop is open. The collection itself refuses public creates. */
export const registerEndpoint: Endpoint = {
  path: "/shop/register",
  method: "post",
  handler: async (req) => {
    if (!(await getShopAccess(req)).open) return shopClosed();

    const parsed = registerSchema.safeParse(await readJson(req));
    if (!parsed.success) return fail(400, firstIssue(parsed.error));

    const { totalDocs } = await req.payload.count({
      collection: "customers",
      where: { email: { equals: parsed.data.email } },
      overrideAccess: true,
    });
    if (totalDocs > 0) {
      return fail(409, "There's already an account with this email. Sign in, or reset your password.");
    }

    await req.payload.create({ collection: "customers", data: parsed.data, overrideAccess: true });
    return Response.json({ ok: true }, { status: 201 });
  },
};
