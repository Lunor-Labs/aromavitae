"use client";

import { useCartStore } from "@/lib/shop/cartStore";
import { cn, formatSize } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant;
  className?: string;
}

export function AddToCartButton({ product, variant, className }: AddToCartButtonProps) {
  const add = useCartStore((state) => state.add);
  const priced = variant ?? product;
  const salePrice = priced.salePrice != null && priced.salePrice < priced.price ? priced.salePrice : null;

  return (
    <button
      type="button"
      onClick={() =>
        add({
          productId: Number(product.id),
          variantId: variant?.id ?? null,
          name: product.name,
          sizeLabel: formatSize(priced),
          image: variant?.image ?? product.image,
          unitPriceLkr: salePrice ?? priced.price,
        })
      }
      className={cn(
        "flex items-center justify-center gap-2 bg-forest text-warm-white font-medium tracking-[0.15em] uppercase",
        "hover:bg-forest-light transition-colors duration-200 rounded",
        className
      )}
    >
      Add to cart
    </button>
  );
}
