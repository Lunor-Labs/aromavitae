import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { BlogDetail } from "@/components/features/blog/BlogDetail";
import { fetchBlogPost } from "@/lib/api";

// Blog content comes from the API at request time — see the note in lib/api.ts
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} — AROMAVITAE Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <PageHero
        title={post.title}
        tagline={post.category?.name?.toUpperCase() ?? "STORIES & INSIGHTS"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />
      <ScrollRevealWrapper>
        <BlogDetail post={post} />
      </ScrollRevealWrapper>
    </>
  );
}
