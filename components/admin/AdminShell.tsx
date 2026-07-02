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
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 h-14">
          <Link href="/admin" className="font-semibold tracking-wide text-forest">
            AROMAVITAE · ADMIN
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">{email}</span>
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-100 transition text-xs"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-60 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-3.5rem)]">
          <nav className="py-4">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
        <main className="flex-1 p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
