import type { AnnouncementContent } from "@/types/content";

interface Props {
  content: AnnouncementContent;
}

export function AnnouncementBar({ content }: Props) {
  const messages = content.messages;
  const repeated = [...messages, ...messages];

  return (
    <div className="bg-forest text-gold overflow-hidden py-2">
      <div className="animate-marquee flex whitespace-nowrap">
        {repeated.map((msg, i) => (
          <span key={i} className="mx-8 text-xs tracking-widest uppercase font-light">
            {msg}
            {i < repeated.length - 1 && (
              <span className="ml-8 text-gold/40">|</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
