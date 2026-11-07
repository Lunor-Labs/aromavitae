"use client";

import { useShop } from "@/components/features/shop/ShopProvider";
import { WhatsAppOrderButton } from "@/components/ui/WhatsAppOrderButton";
import { isProductSoldOut, isSoldOut } from "@/lib/shop/stock";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types/product";

interface BuyButtonProps {
  product: Product;
  /** The size picked on the product page; cards leave it out. */
  variant?: ProductVariant;
  /** The label of the WhatsApp button shown while the shop is off. */
  children: React.ReactNode;
  className?: string;
}

export function BuyButton({ product, variant, children, className }: BuyButtonProps) {
  const { enabled } = useShop();
  const soldOut = enabled && (variant ? isSoldOut(variant) : isProductSoldOut(product));

  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "flex items-center justify-center bg-cream-dark text-muted font-medium tracking-[0.15em] uppercase rounded cursor-not-allowed",
          className
        )}
      >
        Sold out
      </button>
    );
  }

  return (
    <WhatsAppOrderButton product={product} variant={variant} className={className}>
      {children}
    </WhatsAppOrderButton>
  );
}
