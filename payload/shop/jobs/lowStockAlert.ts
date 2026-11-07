import type { PayloadRequest, TaskConfig } from "payload";
import type { LowStockItem } from "../../../lib/shop/lowStock";
import { sendStaffAlert } from "../email/send";
import { escapeHtml } from "../email/templates";
import { serverUrl } from "../http";

export const lowStockAlertTask: TaskConfig = {
  slug: "sendLowStockAlert",
  retries: 4,
  inputSchema: [{ name: "items", type: "json", required: true }],
  handler: async ({ input, req }) => {
    const { items } = input as unknown as { items: LowStockItem[] };
    const rows = items
      .map((item) => {
        const size = item.sizeLabel ? ` (${escapeHtml(item.sizeLabel)})` : "";
        const link = `${serverUrl()}/admin/collections/products/${item.productId}`;
        return `<li><a href="${escapeHtml(link)}">${escapeHtml(item.name)}${size}</a>: ${item.stock} left</li>`;
      })
      .join("");
    const count = items.length === 1 ? `${items[0].name} is` : `${items.length} items are`;
    await sendStaffAlert(req, `Low stock: ${count} running low`, "Running low", `<ul>${rows}</ul>`);
    return { output: {} };
  },
};

/** Queued with whatever changed the stock, so it only goes out if that saved. */
export async function queueLowStockAlert(req: PayloadRequest, items: LowStockItem[]): Promise<void> {
  if (items.length === 0) return;
  await req.payload.jobs.queue({
    task: "sendLowStockAlert",
    queue: "shop",
    input: { items: items as unknown as Record<string, unknown>[] },
    req,
  });
}
