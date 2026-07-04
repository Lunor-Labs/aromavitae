"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/singletons/hero", label: "Hero" },
  { href: "/admin/singletons/story", label: "Story" },
  { href: "/admin/singletons/navbar", label: "Navbar" },
  { href: "/admin/singletons/footer", label: "Footer" },
  { href: "/admin/singletons/announcement", label: "Announcement" },
  { href: "/admin/singletons/giftSetsBanner", label: "Gift Sets Banner" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
    });
  }, []);

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Login page renders without the shell
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-2">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-1.5 rounded hover:bg-slate-100 transition"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/admin" className="font-semibold tracking-wide text-forest text-sm md:text-base">
              AROMAVITAE · ADMIN
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-sm">
            <span className="text-slate-500 text-xs hidden sm:inline truncate max-w-[160px]">{email}</span>
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-100 transition text-xs"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar — drawer on mobile, static on desktop */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-60 shrink-0 border-r border-slate-200 bg-white",
            "transform transition-transform duration-200 ease-in-out",
            "md:static md:translate-x-0 md:z-auto md:min-h-[calc(100vh-3.5rem)]",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 md:hidden">
            <span className="text-sm font-medium text-slate-700">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-slate-100 transition text-slate-500 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <nav className="py-4">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "block px-6 py-2 text-sm transition",
                    active
                      ? "bg-forest/5 text-forest border-l-2 border-forest font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 min-w-0 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
