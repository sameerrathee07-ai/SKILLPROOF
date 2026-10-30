import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/auth/session";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // 1. Force HTTPS in production
  if (process.env.NODE_ENV === "production") {
    const proto = request.headers.get("x-forwarded-proto");
    const host = request.headers.get("host") || "";
    if (proto === "http" && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      const url = request.nextUrl.clone();
      url.protocol = "https:";
      return NextResponse.redirect(url, 301);
    }
  }

  const { pathname, search } = request.nextUrl;

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isOrg = pathname === "/org" || pathname.startsWith("/org/");
  const isPitch = /^\/problems\/[^/]+\/pitch(\/|$)/.test(pathname);
  if (!isAdmin && !isOrg && !isPitch) return NextResponse.next();

  let role: string | undefined;

  // 1. Check custom signed session cookie (used by developer sign-in)
  const customSession = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (customSession) {
    role = customSession.role;
  } else {
    // 2. Check NextAuth JWT token (used by Google OAuth)
    try {
      const nextAuthToken = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (nextAuthToken) {
        role = (nextAuthToken.role as string) || "SOLVER";
      }
    } catch {
      // Ignored if token cannot be decoded
    }
  }

  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const allowed = isAdmin
    ? role === "ADMIN"
    : isOrg
      ? role === "POSTER" || role === "ADMIN"
      : role === "SOLVER";
  return allowed ? NextResponse.next() : NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/org",
    "/org/:path*",
    "/admin",
    "/admin/:path*",
    "/problems/:path*/pitch",
    "/problems/:path*/pitch/:path*",
  ],
};
