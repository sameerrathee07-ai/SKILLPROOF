import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isOrg = pathname === "/org" || pathname.startsWith("/org/");
  const isPitch = /^\/problems\/[^/]+\/pitch(\/|$)/.test(pathname);
  if (!isAdmin && !isOrg && !isPitch) return NextResponse.next();

  // Signature check only: the edge runtime cannot reach Prisma/SQLite. The
  // user-exists check lives in getSessionUser for Node routes.
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const allowed = isAdmin
    ? session.role === "ADMIN"
    : isOrg
      ? session.role === "POSTER" || session.role === "ADMIN"
      : session.role === "SOLVER";
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
