import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/features/checkout/CheckoutForm";
import { OrderPageFrame } from "@/components/features/checkout/OrderPageFrame";
import { isShopOpen } from "@/lib/shop/cms";
import { getCustomer } from "@/lib/shop/customer";

export default async function CheckoutPage() {
  if (!(await isShopOpen())) notFound();
  const customer = await getCustomer();

  return (
    <OrderPageFrame title="Checkout">
      <CheckoutForm customer={customer} />
    </OrderPageFrame>
  );
}
