import { HeroSection } from "@/components/features/hero/HeroSection";
import { StoryHeritage } from "@/components/features/story/StoryHeritage";
import { BestSellers } from "@/components/features/products/BestSellers";
import { ShopByCategory } from "@/components/features/categories/ShopByCategory";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { GiftSetsBanner } from "@/components/features/gifts/GiftSetsBanner";
import { Testimonials } from "@/components/features/testimonials/Testimonials";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { fetchContent } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await fetchContent();
  const { products, categories, testimonials, singletons } = content;

  return (
    <>
      <HeroSection content={singletons.hero} />
      <ScrollRevealWrapper>
        <StoryHeritage content={singletons.story} />
        <BestSellers products={products} />
        <ShopByCategory categories={categories} />
        <TrustBadges />
        <GiftSetsBanner content={singletons.giftSetsBanner} />
        <Testimonials testimonials={testimonials} />
      </ScrollRevealWrapper>
    </>
  );
}

