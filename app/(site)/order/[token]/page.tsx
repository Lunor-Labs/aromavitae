import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderDetails } from "@/components/features/checkout/OrderDetails";
import { OrderPageFrame } from "@/components/features/checkout/OrderPageFrame";
import { getOrderAction } from "@/lib/shop/actions/checkout";
import { STATUS_LABELS } from "@/lib/shop/orderStatus";

interface Props {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

/** Order tracking. The unguessable link is the key, so guests can use it too. */
export default async function OrderPage({ params }: Props) {
  const { token } = await params;
  const result = await getOrderAction(token);
  if (!result.ok) notFound();
  const order = result.data;

  return (
    <OrderPageFrame title={`Order ${order.orderNumber}`} tagline="YOUR ORDER">
      <div className="max-w-[760px] mx-auto">
        <p className="text-sm text-muted mb-6">
          Status: <strong className="text-charcoal">{STATUS_LABELS[order.status]}</strong>
        </p>
        {order.canRetry && (
          <p className="text-sm text-muted mb-6">
            This order hasn&apos;t been paid for yet.{" "}
            <Link href={`/checkout/failed/${order.token}`} className="text-forest underline underline-offset-2">
              Pay now
            </Link>
          </p>
        )}
        <OrderDetails order={order} />
      </div>
    </OrderPageFrame>
  );
}
