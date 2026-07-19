import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

async function isValidToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  // Only guard /admin/* (login page itself is public)
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !(await isValidToken(token))) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
