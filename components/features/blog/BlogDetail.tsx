import Image from "next/image";
import { estimateReadTime, formatBlogDate } from "@/lib/blog";
import type { BlogPost } from "@/types/product";

interface Props {
  post: BlogPost;
}

// `post.content` is sanitized server-side (see api/src/lib/sanitizeHtml.ts) to a
// fixed tag allowlist matching the admin editor's toolbar — safe to render as-is.
export function BlogDetail({ post }: Props) {
  return (
    <article className="py-16 md:py-24 bg-warm-white reveal">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="flex items-center gap-3 mb-6">
          {post.category?.name && (
            <span className="text-[10px] font-bold tracking-[0.2em] text-forest uppercase bg-forest/10 px-2.5 py-1 rounded-full">
              {post.category.name}
            </span>
          )}
          <span className="text-xs text-muted">{formatBlogDate(post.publishedAt)}</span>
          <span className="text-xs text-muted">·</span>
          <span className="text-xs text-muted">{estimateReadTime(post.content)}</span>
        </div>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal leading-tight mb-8">
          {post.title}
        </h1>

        <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-cream mb-10">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 800px) 100vw, 800px"
          />
        </div>

        <div
          className="text-sm md:text-base text-muted leading-relaxed
                     [&_p]:mb-5 [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:md:text-3xl [&_h1]:font-bold
                     [&_h1]:text-charcoal [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:font-heading [&_h2]:text-xl
                     [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:text-charcoal [&_h2]:mt-8 [&_h2]:mb-3
                     [&_strong]:text-charcoal [&_strong]:font-semibold [&_u]:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
