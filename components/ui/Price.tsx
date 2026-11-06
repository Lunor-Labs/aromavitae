import { cn, formatPrice, formatPriceRange, percentOff } from "@/lib/utils";

interface PriceProps {
  currency: string;
  price: number;
  salePrice?: number | null;
  /** Top of a range: shows "LKR 18,000–24,000", never with a discount. */
  priceMax?: number | null;
  size?: "sm" | "lg";
  /** Prefix with "From" — the cheapest of several sizes. */
  from?: boolean;
  className?: string;
}

/**
 * A price, or a sale price with the original struck through. The large one, on
 * the product page, also spells out the % off; cards carry that as a badge.
 */
export function Price({ currency, price, salePrice, priceMax, size = "sm", from, className }: PriceProps) {
  const lg = size === "lg";

  if (priceMax != null && priceMax > price) {
    return (
      <p className={cn("font-bold text-charcoal", lg ? "text-2xl" : "text-sm", className)}>
        {formatPriceRange(currency, price, priceMax)}
      </p>
    );
  }

  const off = percentOff(price, salePrice);

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      {from && <span className={cn("text-muted", lg ? "text-sm" : "text-xs")}>From</span>}
      <span className={cn("font-bold text-charcoal", lg ? "text-2xl" : "text-sm")}>
        {formatPrice(currency, off ? salePrice! : price)}
      </span>
      {off && (
        <>
          <s className={cn("text-muted", lg ? "text-base" : "text-xs")}>{formatPrice(currency, price)}</s>
          {lg && <span className="text-sm font-bold text-gold-dark">-{off}%</span>}
        </>
      )}
    </p>
  );
}
