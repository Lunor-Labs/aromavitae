import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { BlogList } from "@/components/features/blog/BlogList";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog — Spice Stories, Wellness Tips & Recipes",
  description:
    "Explore our blog for stories about Ceylon spices, wellness tips, authentic Sri Lankan recipes, and behind-the-scenes glimpses of AROMAVITAE.",
  keywords: [
    "Ceylon spice blog",
    "Sri Lankan recipes",
    "spice wellness tips",
    "agarwood perfume guide",
    "AROMAVITAE blog",
  ],
  openGraph: {
    title: "Blog — AROMAVITAE Stories & Insights",
    description:
      "Stories about Ceylon spices, wellness tips, authentic recipes, and behind-the-scenes glimpses.",
  },
};

export default async function BlogPage() {
  const content = await getContent();

  return (
    <>
      <PageHero
        title="Our Blog"
        tagline="STORIES & INSIGHTS"
        subtitle="Stories, recipes, and insights from the world of premium Ceylon spices and agarwood perfumes."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog" },
        ]}
      />
      <ScrollRevealWrapper>
        <BlogList posts={content.blogPosts} categories={content.blogCategories} />
      </ScrollRevealWrapper>
    </>
  );
}
