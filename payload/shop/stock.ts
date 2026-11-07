import type { PostgresAdapter } from "@payloadcms/db-postgres";
import { sql } from "@payloadcms/db-postgres";
import type { PayloadRequest } from "payload";

/**
 * Stock moves through plain SQL rather than Payload's update, because the check
 * and the change have to be one statement: two buyers racing for the last one
 * can't both get it. Everything here joins the request's transaction.
 */

async function database(req: PayloadRequest) {
  const adapter = req.payload.db as unknown as PostgresAdapter;
  const session = req.transactionID ? adapter.sessions[await req.transactionID] : undefined;
  return session?.db ?? adapter.drizzle;
}

interface StockLine {
  productId: number;
  variantId?: string | null;
  quantity: number;
}

export interface StockTaken {
  /** What's left. Null means this item's stock isn't tracked. */
  remaining: number | null;
}

/** Takes the quantity if there's enough. Null means there wasn't, and nothing changed. */
export async function takeStock(req: PayloadRequest, line: StockLine): Promise<StockTaken | null> {
  const db = await database(req);
  const result = line.variantId
    ? await db.execute(sql`
        UPDATE "products_variants" SET "stock" = "stock" - ${line.quantity}
        WHERE "id" = ${line.variantId} AND ("stock" IS NULL OR "stock" >= ${line.quantity})
        RETURNING "stock"`)
    : await db.execute(sql`
        UPDATE "products" SET "stock" = "stock" - ${line.quantity}
        WHERE "id" = ${line.productId} AND ("stock" IS NULL OR "stock" >= ${line.quantity})
        RETURNING "stock"`);

  const row = result.rows[0] as { stock: string | number | null } | undefined;
  if (!row) return null;
  return { remaining: row.stock == null ? null : Number(row.stock) };
}

/** Puts a quantity back. A product or size deleted since simply has nothing to return to. */
export async function returnStock(req: PayloadRequest, line: StockLine): Promise<void> {
  const db = await database(req);
  if (line.variantId) {
    await db.execute(sql`
      UPDATE "products_variants" SET "stock" = "stock" + ${line.quantity}
      WHERE "id" = ${line.variantId} AND "stock" IS NOT NULL`);
  } else {
    await db.execute(sql`
      UPDATE "products" SET "stock" = "stock" + ${line.quantity}
      WHERE "id" = ${line.productId} AND "stock" IS NOT NULL`);
  }
}

/** Holds this order's row until the transaction ends, so two PayHere callbacks can't both apply. */
export async function lockOrder(req: PayloadRequest, orderId: number): Promise<void> {
  const db = await database(req);
  await db.execute(sql`SELECT "id" FROM "orders" WHERE "id" = ${orderId} FOR UPDATE`);
}
