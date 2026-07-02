"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavbarContent } from "@/types/content";

interface Props {
  content: NavbarContent;
}

export function Navbar({ content }: Props) {
  const { brand, links, cta } = content;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          {links.map((link) => (
            <div key={link.label} className="relative group">
              {link.children && link.children.length > 0 ? (
                <>
                  <button
                    className="px-3 py-2 text-xs font-medium tracking-[0.15em] text-charcoal
                               hover:text-forest transition-colors duration-200
                               flex items-center gap-1"
                    onMouseEnter={() => setShopOpen(true)}
                    onMouseLeave={() => setShopOpen(false)}
                  >
                    {link.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={cn(
                      "absolute top-full left-0 bg-warm-white border border-border rounded-lg shadow-lg py-2 min-w-[180px] transition-all duration-200",
                      shopOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                    )}
                    onMouseEnter={() => setShopOpen(true)}
                    onMouseLeave={() => setShopOpen(false)}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-xs tracking-wider text-charcoal
                                   hover:bg-cream hover:text-forest transition-colors duration-150"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={link.href}
                  className="px-3 py-2 text-xs font-medium tracking-[0.15em] text-charcoal
                             hover:text-forest transition-colors duration-200"
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <button className="p-2 text-charcoal hover:text-forest transition-colors" aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 text-charcoal hover:text-forest transition-colors" aria-label="Account">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="p-2 text-charcoal hover:text-forest transition-colors" aria-label="Wishlist">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="p-2 text-charcoal hover:text-forest transition-colors relative" aria-label="Cart">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-forest text-warm-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>

          <Link
            href={cta.href}
            className="hidden sm:inline-flex px-5 py-2 bg-forest text-warm-white text-xs font-medium
                       tracking-[0.15em] rounded border border-gold/30
                       hover:bg-forest-light transition-all duration-200"
          >
            {cta.label}
          </Link>

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
          {links.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                className="block py-2.5 text-sm font-medium tracking-wider text-charcoal
                           hover:text-forest hover:pl-2 transition-all duration-200"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
              {link.children && link.children.length > 0 && (
                <div className="pl-4 space-y-1">
                  {link.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="block py-1.5 text-xs text-muted hover:text-forest transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
