"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "PRODUCTS", href: "/products" },
  { label: "GALLERY", href: "/gallery" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT US", href: "/contact" },
  { label: "BLOG", href: "/blog" },
];

const brand = { name: "AromaVitae", tagline: "NATURE'S FINEST · CEYLON'S PRIDE" };

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-warm-white/95 backdrop-blur-md shadow-md"
          : "bg-warm-white"
      )}
    >
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <span className="font-heading text-2xl font-bold text-forest tracking-wide">
              {brand.name}
            </span>
            <span className="text-[10px] text-muted tracking-[0.2em] -mt-1">
              {brand.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-xs font-medium tracking-[0.15em] transition-colors duration-200 relative",
                  isActive
                    ? "text-forest"
                    : "text-charcoal hover:text-forest"
                )}
              >
                {link.label}
                {/* Active indicator */}
                <span
                  className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gold transition-all duration-300",
                    isActive ? "w-6" : "w-0"
                  )}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {/* CTA Button */}
          <Link
            href="/contact"
            className="hidden sm:inline-flex px-5 py-2 bg-forest text-warm-white text-xs font-medium
                       tracking-[0.15em] rounded border border-gold/30
                       hover:bg-forest-light transition-all duration-200"
          >
            CONTACT FOR INFO
          </Link>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-charcoal"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-warm-white border-t border-border px-6 py-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "block py-2.5 text-sm font-medium tracking-wider transition-all duration-200",
                  isActive
                    ? "text-forest pl-2 border-l-2 border-gold"
                    : "text-charcoal hover:text-forest hover:pl-2"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Mobile CTA */}
          <Link
            href="/contact"
            className="block mt-4 text-center px-5 py-3 bg-forest text-warm-white text-xs font-medium
                       tracking-[0.15em] rounded border border-gold/30
                       hover:bg-forest-light transition-all duration-200"
          >
            CONTACT FOR INFO
          </Link>
        </div>
      </div>
    </header>
  );
}
