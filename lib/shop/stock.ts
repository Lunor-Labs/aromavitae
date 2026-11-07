import type { Product } from "@/types/product";

interface Stocked {
  stock?: number | null;
}

/** Empty stock means it isn't tracked, so it never sells out. */
export function isSoldOut(item: Stocked): boolean {
  return item.stock != null && item.stock <= 0;
}

/** A product with sizes is only sold out once every size is. */
export function isProductSoldOut(product: Pick<Product, "stock" | "variants">): boolean {
  return product.variants.length > 0 ? product.variants.every(isSoldOut) : isSoldOut(product);
}
