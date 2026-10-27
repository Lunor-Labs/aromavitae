import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { ProductDetail } from "@/components/features/products/ProductDetail";
import { RelatedProducts } from "@/components/features/products/RelatedProducts";
import { getContent, getProduct, getProductIdByLegacyId } from "@/lib/content";

const MAX_RELATED = 4;

// Product data comes from Payload at request time — see lib/content.ts
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — AROMAVITAE`,
    description: product.description ?? `${product.name} from AROMAVITAE's premium collection.`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    // Links shared before the move to Payload use the old admin's ids
    const currentId = await getProductIdByLegacyId(id);
    if (currentId) permanentRedirect(`/products/${currentId}`);
    notFound();
  }

  const content = await getContent();
  const sameCategory = content.products.filter(
    (p) => p.id !== product.id && p.categoryId && p.categoryId === product.categoryId
  );
  const fallback = content.products.filter((p) => p.id !== product.id);
  const related = (sameCategory.length > 0 ? sameCategory : fallback).slice(0, MAX_RELATED);

  return (
    <>
      <PageHero
        title={product.name}
        tagline={product.category?.name?.toUpperCase() ?? "PREMIUM COLLECTIONS"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.name },
        ]}
      />
      <ScrollRevealWrapper>
        <ProductDetail product={product} />
        <RelatedProducts products={related} />
      </ScrollRevealWrapper>
    </>
  );
}
