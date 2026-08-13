import { HeroSection } from "@/components/features/hero/HeroSection";
import { StoryHeritage } from "@/components/features/story/StoryHeritage";
import { OurBestProducts } from "@/components/features/products/OurBestProducts";
import { ShopByCategory } from "@/components/features/categories/ShopByCategory";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { GiftSetsBanner } from "@/components/features/gifts/GiftSetsBanner";
import { OutletsPreview } from "@/components/features/outlets/OutletsPreview";
import { Testimonials } from "@/components/features/testimonials/Testimonials";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { fetchContent } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await fetchContent();
  const { products, categories, testimonials, outlets, singletons } = content;

  return (
    <>
      <HeroSection />
      <ScrollRevealWrapper>
        <StoryHeritage />
        <OurBestProducts products={products} />
        <ShopByCategory categories={categories} products={products} />
        <TrustBadges />
        <GiftSetsBanner content={singletons.giftSetsBanner} />
        <OutletsPreview outlets={outlets} />
        <Testimonials testimonials={testimonials} />
      </ScrollRevealWrapper>
    </>
  );
}
