/** When stock counts as low. Empty stock isn't tracked, so it's never low. */

export const DEFAULT_LOW_STOCK_LEVEL = 5;

export interface LowStockItem {
  productId: number;
  name: string;
  sizeLabel: string | null;
  stock: number;
  level: number;
}

/**
 * Whether stock just fell to or below its level, so staff are alerted once rather
 * than on every sale after that. Starting to track an already-low item doesn't
 * count: whoever typed the number knows.
 */
export function crossedLowStock(before: number | null | undefined, after: number | null | undefined, level: number): boolean {
  return before != null && after != null && before > level && after <= level;
}

interface StockedProduct {
  id: number;
  name: string;
  stock?: number | null;
  lowStockAt?: number | null;
  sizeValue?: number | null;
  sizeUnit?: string | null;
  variants?: { stock?: number | null; sizeValue: number; sizeUnit: string }[] | null;
}

const sizeLabel = (item: { sizeValue?: number | null; sizeUnit?: string | null }) =>
  item.sizeValue != null && item.sizeUnit ? `${item.sizeValue} ${item.sizeUnit}` : null;

/** Everything at or below its level, lowest first. */
export function findLowStock(products: StockedProduct[], defaultLevel: number): LowStockItem[] {
  const items = products.flatMap((product) => {
    const level = product.lowStockAt ?? defaultLevel;
    const stocked = product.variants?.length ? product.variants : [product];
    return stocked.flatMap((item) =>
      item.stock != null && item.stock <= level
        ? [{ productId: product.id, name: product.name, sizeLabel: sizeLabel(item), stock: item.stock, level }]
        : []
    );
  });
  return items.sort((a, b) => a.stock - b.stock);
}
