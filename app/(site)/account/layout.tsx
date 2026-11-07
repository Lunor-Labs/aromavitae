import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isShopOpen } from "@/lib/shop/cms";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

/** Accounts only exist while the shop is open to this visitor. */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!(await isShopOpen())) notFound();
  return children;
}
