import { notFound, redirect } from "next/navigation";
import { OrderPageFrame } from "@/components/features/checkout/OrderPageFrame";
import { PaymentFailed } from "@/components/features/checkout/PaymentFailed";
import { getContent } from "@/lib/content";
import { getOrderAction } from "@/lib/shop/actions/checkout";
import { whatsappNumber } from "@/lib/whatsapp";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CheckoutFailedPage({ params }: Props) {
  const { token } = await params;
  const [order, { singletons }] = await Promise.all([getOrderAction(token), getContent()]);
  if (!order.ok) notFound();
  if (order.data.isPaid) redirect(`/order/${token}`);

  return (
    <OrderPageFrame title="Payment">
      <PaymentFailed
        order={order.data}
        whatsapp={whatsappNumber(singletons.contact)}
        email={singletons.contact.email}
      />
    </OrderPageFrame>
  );
}
