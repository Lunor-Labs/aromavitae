"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { estimateReadTime, formatBlogDate } from "@/lib/blog";
import type { BlogCategory, BlogPost } from "@/types/product";

const ALL = "All";

interface Props {
  posts: BlogPost[];
  categories: BlogCategory[];
}

export function BlogList({ posts, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState(ALL);

  const categoryNames = useMemo(() => [ALL, ...categories.map((c) => c.name)], [categories]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === ALL) return posts;
    return posts.filter((p) => p.category?.name === activeCategory);
  }, [activeCategory, posts]);

  const featuredPost = filteredPosts.find((p) => p.isFeatured);
  const regularPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id);

  return (
    <section className="py-16 md:py-24 bg-warm-white reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categoryNames.map((cat) => (
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
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="grid md:grid-cols-2 gap-0 rounded-lg overflow-hidden border border-border bg-cream group hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                <Image
                  src={featuredPost.coverImage}
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
                  {featuredPost.category?.name && (
                    <span className="text-[10px] font-bold tracking-[0.2em] text-forest uppercase bg-forest/10 px-2.5 py-1 rounded-full">
                      {featuredPost.category.name}
                    </span>
                  )}
                  <span className="text-xs text-muted">{formatBlogDate(featuredPost.publishedAt)}</span>
                  <span className="text-xs text-muted">·</span>
                  <span className="text-xs text-muted">{estimateReadTime(featuredPost.content)}</span>
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal leading-tight mb-4 group-hover:text-forest transition-colors duration-300">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.15em] text-forest underline underline-offset-4 decoration-gold hover:decoration-forest transition-colors duration-200 self-start">
                  READ ARTICLE
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Blog Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📝</div>
            <p className="font-heading text-xl text-charcoal mb-2">
              No posts found
            </p>
            <p className="text-sm text-muted">
              Try selecting a different category.
            </p>
          </div>
        ) : regularPosts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-warm-white border border-border rounded-lg overflow-hidden
                           hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-cream">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {post.category?.name && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-forest/90 text-warm-white text-[10px] font-bold tracking-[0.15em] rounded-sm uppercase">
                        {post.category.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted">{formatBlogDate(post.publishedAt)}</span>
                    <span className="text-xs text-muted">·</span>
                    <span className="text-xs text-muted">{estimateReadTime(post.content)}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-charcoal leading-tight mb-3 group-hover:text-forest transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.1em] text-forest">
                    READ MORE
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
