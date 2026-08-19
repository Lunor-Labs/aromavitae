import Image from "next/image";
import Link from "next/link";
import type { Outlet } from "@/types/product";

interface Props {
  outlets: Outlet[];
}

export function OutletsPreview({ outlets }: Props) {
  if (outlets.length === 0) return null;

  const preview = outlets.slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-cream reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
          {/* Left — Heading with CTA */}
          <div className="shrink-0 md:max-w-[240px]">
            <div className="mb-4 relative overflow-hidden" style={{ height: '36px' }}>
              <Image
                src="/images/misc/line.png"
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 260px"
                style={{ objectFit: 'cover', objectPosition: 'center center' }}
              />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal tracking-wide mb-4">
              OUR OUTLETS
            </h2>
            <p className="text-sm text-muted font-body leading-relaxed mb-6">
              Visit AROMAVITAE in person across Ceylon.
            </p>
            <Link
              href="/outlets"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-warm-white text-xs font-medium
                         tracking-[0.15em] hover:bg-forest-light transition-colors duration-200 rounded"
            >
              VISIT ALL OUTLETS
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Right — Outlet Cards (horizontal scroll) */}
          {/* `scroll-pl-6` matches the full-bleed row's own `px-6`: without it a
              snapped card lands against the viewport edge instead of the gutter. */}
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 scroll-pl-6 md:scroll-pl-0 snap-x snap-mandatory scrollbar-hide flex-1">
            {preview.map((outlet) => (
              <Link
                key={outlet.id}
                href="/outlets"
                className="group shrink-0 w-[240px] md:w-[260px] snap-start"
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-warm-white mb-3">
                  <Image
                    src={outlet.image}
                    alt={outlet.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="260px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <p className="text-sm font-heading font-bold text-charcoal group-hover:text-forest transition-colors duration-200">
                  {outlet.name}
                </p>
                <p className="text-xs text-muted font-body mt-1 line-clamp-1">
                  {outlet.address}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
