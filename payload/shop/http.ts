import type { PayloadRequest } from "payload";

/** Helpers shared by the shop's endpoints, which only the storefront's server and PayHere call. */

export const fail = (status: number, message: string) => Response.json({ message }, { status });

export const shopClosed = () => fail(403, "The shop isn't open right now.");

export async function readJson(req: PayloadRequest): Promise<unknown> {
  try {
    return await req.json?.();
  } catch {
    return null;
  }
}

/** The CMS's own address, which PayHere calls back. */
export const serverUrl = () => (process.env.SERVER_URL || "http://localhost:3000").replace(/\/+$/, "");

/** The storefront's address, where customers are sent. Without SITE_URL (local dev), it's this app. */
export const siteUrl = () => (process.env.SITE_URL || serverUrl()).replace(/\/+$/, "");

/** The logged-in customer, if the caller is one. Staff don't count: they don't shop as themselves. */
export const customerId = (req: PayloadRequest): number | null =>
  req.user?.collection === "customers" ? req.user.id : null;
