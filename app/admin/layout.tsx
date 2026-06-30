import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin · Aromavitae",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
