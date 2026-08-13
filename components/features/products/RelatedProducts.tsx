import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

export function RelatedProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-cream-dark reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal tracking-wide">
            YOU MAY ALSO LIKE
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
