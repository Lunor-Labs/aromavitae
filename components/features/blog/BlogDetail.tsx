import Image from "next/image";
import { RichText } from "@/components/ui/RichText";
import { estimateReadTime, formatBlogDate } from "@/lib/blog";
import type { BlogPost } from "@/types/product";

interface Props {
  post: BlogPost;
}

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

        <RichText html={post.content} />
      </div>
    </article>
  );
}
