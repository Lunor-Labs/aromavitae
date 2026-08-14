import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

export function RelatedProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-12 border-t border-border reveal">
      <div className="max-w-[1100px] mx-auto px-6">
        <h2 className="text-xs font-medium tracking-[0.2em] text-charcoal uppercase mb-6">
          You May Also Like
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
