import { cookies } from "next/headers";
import type { Customer as CustomerDoc } from "@/payload/payload-types";
import { SESSION_COOKIE, cmsFetch } from "@/lib/shop/cms";
import type { SavedAddress } from "@/lib/shop/schemas";

export interface Customer {
  id: number;
  email: string;
  name: string;
  phone: string;
  addresses: SavedAddress[];
}

function toCustomer(doc: CustomerDoc): Customer {
  return {
    id: doc.id,
    email: doc.email,
    name: doc.name ?? "",
    phone: doc.phone ?? "",
    addresses: (doc.addresses ?? []).map((a) => ({
      label: a.label ?? "",
      isDefault: Boolean(a.isDefault),
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      region: a.region ?? "",
      postalCode: a.postalCode ?? "",
      country: a.country,
    })),
  };
}

/** The logged-in customer, or null when nobody is, or their session has expired. */
export async function getCustomer(): Promise<Customer | null> {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)) return null;
  const me = await cmsFetch<{ user: (CustomerDoc & { collection?: string }) | null }>("customers/me");
  return me.ok && me.data.user ? toCustomer(me.data.user) : null;
}

export async function startSession(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Matches `tokenExpiration` in payload/collections/Customers.ts
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
