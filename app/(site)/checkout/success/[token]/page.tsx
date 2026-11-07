import { notFound } from "next/navigation";
import { OrderPageFrame } from "@/components/features/checkout/OrderPageFrame";
import { PaymentConfirmation } from "@/components/features/checkout/PaymentConfirmation";
import { getOrderAction } from "@/lib/shop/actions/checkout";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CheckoutSuccessPage({ params }: Props) {
  const order = await getOrderAction((await params).token);
  if (!order.ok) notFound();

  return (
    <OrderPageFrame title="Your order">
      <PaymentConfirmation initial={order.data} />
    </OrderPageFrame>
  );
}
