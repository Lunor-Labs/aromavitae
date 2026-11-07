import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartContent } from "@/components/features/cart/CartContent";
import { PageHero } from "@/components/ui/PageHero";
import { isShopOpen } from "@/lib/shop/cms";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  if (!(await isShopOpen())) notFound();

  return (
    <>
      <PageHero title="Your cart" tagline="SHOP" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <section className="py-14 md:py-20 bg-warm-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <CartContent />
        </div>
      </section>
    </>
  );
}
