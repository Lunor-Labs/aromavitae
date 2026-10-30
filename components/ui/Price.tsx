import { cn, formatPrice, percentOff } from "@/lib/utils";

interface PriceProps {
  currency: string;
  price: number;
  salePrice?: number | null;
  size?: "sm" | "lg";
  /** Prefix with "From" — the cheapest of several sizes. */
  from?: boolean;
  className?: string;
}

/**
 * A price, or a sale price with the original struck through. The large one, on
 * the product page, also spells out the % off; cards carry that as a badge.
 */
export function Price({ currency, price, salePrice, size = "sm", from, className }: PriceProps) {
  const off = percentOff(price, salePrice);
  const lg = size === "lg";

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
