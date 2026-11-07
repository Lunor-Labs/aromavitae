"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/features/cart/AddToCartButton";
import { useShop } from "@/components/features/shop/ShopProvider";
import { WhatsAppOrderButton } from "@/components/ui/WhatsAppOrderButton";
import { isProductSoldOut, isSoldOut } from "@/lib/shop/stock";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types/product";

interface BuyButtonProps {
  product: Product;
  /** The size picked on the product page; cards leave it out. */
  variant?: ProductVariant;
  /** The label of the WhatsApp button. */
  children: React.ReactNode;
  className?: string;
}

const LABEL_CLASS = "flex items-center justify-center font-medium tracking-[0.15em] uppercase rounded";

/**
 * How a product is bought. With the shop off, always WhatsApp. With it on, the
 * cart, except that a price range still goes to WhatsApp: a cart needs one exact
 * price, so those wait until the shop gives them one.
 */
export function BuyButton({ product, variant, children, className }: BuyButtonProps) {
  const { enabled } = useShop();

  const whatsApp = (
    <WhatsAppOrderButton product={product} variant={variant} className={className}>
      {children}
    </WhatsAppOrderButton>
  );
  if (!enabled) return whatsApp;

  if (variant ? isSoldOut(variant) : isProductSoldOut(product)) {
    return (
      <button type="button" disabled className={cn(LABEL_CLASS, "bg-cream-dark text-muted cursor-not-allowed", className)}>
        Sold out
      </button>
    );
  }

  // A card has no size picker, so the size is chosen on the product page.
  if (!variant && product.variants.length > 0) {
    return (
      <Link
        href={`/products/${product.id}`}
        className={cn(LABEL_CLASS, "bg-forest text-warm-white hover:bg-forest-light transition-colors duration-200", className)}
      >
        Choose a size
      </Link>
    );
  }

  if (!variant && product.priceMax != null) return whatsApp;

  return <AddToCartButton product={product} variant={variant} className={className} />;
}
