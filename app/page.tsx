import { AnnouncementBar } from "@/components/ui/AnnouncementBar";
import { Navbar } from "@/components/features/navbar/Navbar";
import { HeroSection } from "@/components/features/hero/HeroSection";
import { StoryHeritage } from "@/components/features/story/StoryHeritage";
import { BestSellers } from "@/components/features/products/BestSellers";
import { ShopByCategory } from "@/components/features/categories/ShopByCategory";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { GiftSetsBanner } from "@/components/features/gifts/GiftSetsBanner";
import { Testimonials } from "@/components/features/testimonials/Testimonials";
import { Footer } from "@/components/features/footer/Footer";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ScrollRevealWrapper>
          <StoryHeritage />
          <BestSellers />
          <ShopByCategory />
          <TrustBadges />
          <GiftSetsBanner />
          <Testimonials />
        </ScrollRevealWrapper>
      </main>
      <Footer />
    </>
  );
}
