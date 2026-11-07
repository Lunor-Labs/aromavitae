import type { Endpoint } from "payload";
import { getShopAccess } from "../access";

/** Whether the shop is open to this caller, read fresh rather than from the site's cache. */
export const statusEndpoint: Endpoint = {
  path: "/shop/status",
  method: "get",
  handler: async (req) => {
    const { mode, open, previewOk } = await getShopAccess(req);
    return Response.json({ mode, open, previewOk });
  },
};
