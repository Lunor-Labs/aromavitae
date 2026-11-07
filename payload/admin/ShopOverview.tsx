import Link from "next/link";
import type { ServerProps, Where } from "payload";
import { DEFAULT_LOW_STOCK_LEVEL, findLowStock } from "../../lib/shop/lowStock";
import { formatPrice } from "../../lib/utils";
import styles from "./ShopOverview.module.css";

const MODE_LABELS = { off: "Off", test: "Test", live: "Live" } as const;
const REVENUE_DAYS = 30;
const LOW_STOCK_SHOWN = 10;

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const ordersLink = (status: string) => `/admin/collections/orders?where[status][equals]=${status}`;

/** What needs doing, at the top of the admin dashboard. */
export async function ShopOverview({ payload }: ServerProps) {
  if (!payload) return null;

  const settings = await payload.findGlobal({ slug: "shop-settings", overrideAccess: true });
  const mode = settings.mode ?? "off";

  // Test orders count while testing, and stop counting once the shop is live.
  const scope: Where = mode === "live" ? { isTest: { equals: false } } : {};
  const count = async (where: Where) =>
    (await payload.count({ collection: "orders", where: { and: [scope, where] }, overrideAccess: true })).totalDocs;

  const toShip = await count({ status: { equals: "processing" } });
  const unpaid = await count({ status: { equals: "pending_payment" } });
  const attention = await count({ needsAttention: { exists: true } });

  // Money only ever counts real orders that are still paid.
  const sales = await payload.find({
    collection: "orders",
    where: {
      and: [
        { isTest: { equals: false } },
        { paidAt: { greater_than_equal: daysAgo(REVENUE_DAYS) } },
        { status: { in: ["processing", "shipped", "delivered"] } },
      ],
    },
    select: { totalLkr: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });
  const revenue = sales.docs.reduce((sum, order) => sum + (order.totalLkr ?? 0), 0);

  const products = await payload.find({ collection: "products", pagination: false, depth: 0, overrideAccess: true });
  const lowStock = findLowStock(products.docs, settings.lowStockLevel ?? DEFAULT_LOW_STOCK_LEVEL);

  return (
    <section className={styles.overview}>
      <header className={styles.header}>
        <h2 className={styles.title}>Shop</h2>
        <Link href="/admin/globals/shop-settings" className={styles.mode}>
          {MODE_LABELS[mode]}
        </Link>
      </header>

      <div className={styles.stats}>
        <Link href={ordersLink("processing")} className={styles.stat}>
          <strong>{toShip}</strong> paid, to ship
        </Link>
        <Link href={ordersLink("pending_payment")} className={styles.stat}>
          <strong>{unpaid}</strong> waiting for payment
        </Link>
        <Link href="/admin/collections/orders?where[needsAttention][exists]=true" className={styles.stat}>
          <strong>{attention}</strong> need attention
        </Link>
        <div className={styles.stat}>
          <strong>{formatPrice("LKR", revenue)}</strong> sales, last {REVENUE_DAYS} days
        </div>
      </div>

      {lowStock.length > 0 && (
        <div>
          <h3 className={styles.subtitle}>Running low</h3>
          <ul className={styles.list}>
            {lowStock.slice(0, LOW_STOCK_SHOWN).map((item) => (
              <li key={`${item.productId}:${item.sizeLabel ?? ""}`}>
                <Link href={`/admin/collections/products/${item.productId}`}>
                  {item.name}
                  {item.sizeLabel && ` (${item.sizeLabel})`}
                </Link>
                : {item.stock} left
              </li>
            ))}
          </ul>
          {lowStock.length > LOW_STOCK_SHOWN && <p>And {lowStock.length - LOW_STOCK_SHOWN} more.</p>}
        </div>
      )}
    </section>
  );
}
