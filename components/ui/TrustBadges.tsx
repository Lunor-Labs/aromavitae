import type { TrustBadge } from "@/types/product";

const BADGES: TrustBadge[] = [
  { icon: "🌿", title: "100% NATURAL", subtitle: "No Additives. No Compromise." },
  { icon: "🇱🇰", title: "SRI LANKAN ORIGIN", subtitle: "Proudly Ceylon. Pure & Authentic." },
  { icon: "✨", title: "PREMIUM QUALITY", subtitle: "Carefully Sourced. Expertly Crafted." },
  { icon: "🎁", title: "LUXURY EXPERIENCE", subtitle: "Perfect for You & Your Loved Ones." },
  { icon: "🌍", title: "WORLDWIDE SHIPPING", subtitle: "Delivering Nature's Finest to You." },
];

export function TrustBadges() {
  return (
    <section className="py-8 bg-cream border-y border-border reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-4">
          {BADGES.map((badge) => (
            <div
              key={badge.title}
              className="flex items-center gap-3 md:justify-center"
            >
              <span className="text-2xl shrink-0">{badge.icon}</span>
              <div>
                <p className="text-xs font-bold text-charcoal tracking-wider">
                  {badge.title}
                </p>
                <p className="text-[11px] text-muted leading-tight">
                  {badge.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
