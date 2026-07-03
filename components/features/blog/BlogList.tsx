"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "The Golden Legacy of Ceylon Cinnamon: Why It's the World's Finest",
    excerpt:
      "Discover what makes true Ceylon cinnamon — known as 'Cinnamomum verum' — superior to its common cousin, Cassia. From its delicate layers to its subtle sweetness, learn why connoisseurs and chefs worldwide seek out this Sri Lankan treasure.",
    image: "/images/products/cinnamon.png",
    category: "Spices",
    date: "June 28, 2026",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: "2",
    title: "Agarwood: The Liquid Gold of Perfumery",
    excerpt:
      "Journey into the mystical world of agarwood — one of the most precious natural fragrances on Earth. Learn about its ancient origins, the painstaking process of extraction, and why our Ceylon Oud captures the essence of this rare treasure.",
    image: "/images/products/perfume.png",
    category: "Wellness",
    date: "June 15, 2026",
    readTime: "7 min read",
  },
  {
    id: "3",
    title: "5 Authentic Sri Lankan Recipes Using Premium Spices",
    excerpt:
      "Transform your kitchen with these five classic Sri Lankan recipes that showcase the incredible depth of flavour our premium spices bring. From fragrant rice to rich curries, each recipe is simple yet extraordinary.",
    image: "/images/products/cardamom.png",
    category: "Recipes",
    date: "June 2, 2026",
    readTime: "8 min read",
  },
  {
    id: "4",
    title: "Behind the Scenes: How We Source Our Spices",
    excerpt:
      "Take a virtual tour of the spice gardens and farming communities we partner with in Sri Lanka. See how traditional methods and modern quality standards come together to produce the finest spices.",
    image: "/images/products/clove.png",
    category: "Behind the Scenes",
    date: "May 20, 2026",
    readTime: "4 min read",
  },
  {
    id: "5",
    title: "The Health Benefits of Turmeric: Science Meets Tradition",
    excerpt:
      "For centuries, turmeric has been revered in Ayurvedic medicine. Now modern science is confirming what Sri Lankan healers have known all along. Explore the proven health benefits of this golden spice.",
    image: "/images/products/pepper.png",
    category: "Wellness",
    date: "May 5, 2026",
    readTime: "6 min read",
  },
  {
    id: "6",
    title: "The Perfect Gift: Curating Luxury Spice Sets",
    excerpt:
      "Looking for a unique, meaningful gift? Learn how our luxury spice gift sets are curated and designed to delight — from the hand-selected spices to the elegant packaging that makes unwrapping a sensory experience.",
    image: "/images/products/cardamom.png",
    category: "Behind the Scenes",
    date: "April 18, 2026",
    readTime: "3 min read",
  },
];

const CATEGORIES = ["All", "Spices", "Wellness", "Recipes", "Behind the Scenes"];

export function BlogList() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return BLOG_POSTS;
    return BLOG_POSTS.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  const featuredPost = filteredPosts.find((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => !p.featured);

  return (
    <section className="py-16 md:py-24 bg-warm-white reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2.5 text-xs font-medium tracking-[0.15em] rounded-full border transition-all duration-300",
                activeCategory === cat
                  ? "bg-forest text-warm-white border-forest"
                  : "bg-transparent text-charcoal border-border hover:border-forest hover:text-forest"
              )}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12">
            <div className="grid md:grid-cols-2 gap-0 rounded-lg overflow-hidden border border-border bg-cream group hover:shadow-xl transition-shadow duration-300">
              <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-gold text-forest text-[10px] font-bold tracking-[0.15em] rounded-sm uppercase">
                    FEATURED
                  </span>
                </div>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-forest uppercase bg-forest/10 px-2.5 py-1 rounded-full">
                    {featuredPost.category}
                  </span>
                  <span className="text-xs text-muted">{featuredPost.date}</span>
                  <span className="text-xs text-muted">·</span>
                  <span className="text-xs text-muted">{featuredPost.readTime}</span>
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal leading-tight mb-4 group-hover:text-forest transition-colors duration-300">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.15em] text-forest underline underline-offset-4 decoration-gold hover:decoration-forest transition-colors duration-200 self-start cursor-pointer">
                  READ ARTICLE
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        {regularPosts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-warm-white border border-border rounded-lg overflow-hidden
                           hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-cream">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-forest/90 text-warm-white text-[10px] font-bold tracking-[0.15em] rounded-sm uppercase">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted">{post.date}</span>
                    <span className="text-xs text-muted">·</span>
                    <span className="text-xs text-muted">{post.readTime}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-charcoal leading-tight mb-3 group-hover:text-forest transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.1em] text-forest cursor-pointer">
                    READ MORE
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📝</div>
            <p className="font-heading text-xl text-charcoal mb-2">
              No posts found
            </p>
            <p className="text-sm text-muted">
              Try selecting a different category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
