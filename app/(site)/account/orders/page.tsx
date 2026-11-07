import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountPage } from "@/components/features/account/AccountPage";
import { cmsFetch } from "@/lib/shop/cms";
import { getCustomer } from "@/lib/shop/customer";
import { STATUS_LABELS } from "@/lib/shop/orderStatus";
import type { OrderView } from "@/lib/shop/orderView";
import { formatPrice } from "@/lib/utils";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function OrderHistoryPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/account/login?next=/account/orders");

  const result = await cmsFetch<OrderView[]>("shop/orders");
  const orders = result.ok ? result.data : [];

  return (
    <AccountPage title="Your orders" width="wide">
      {!result.ok && <p className="text-sm text-red-800">{result.message}</p>}
      {result.ok && orders.length === 0 && <p className="text-sm text-muted">You haven&apos;t placed an order yet.</p>}
      <ul className="divide-y divide-border border-y border-border">
        {orders.map((order) => (
          <li key={order.token}>
            <Link href={`/order/${order.token}`} className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-4 text-sm hover:bg-cream/50 px-2">
              <span className="font-medium text-charcoal">{order.orderNumber}</span>
              <span className="text-muted">{DATE_FORMAT.format(new Date(order.createdAt))}</span>
              <span className="text-muted">{STATUS_LABELS[order.status]}</span>
              <span className="font-medium text-charcoal">{formatPrice(order.currency, order.total)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </AccountPage>
  );
}
