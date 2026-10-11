import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "cp_admin";
const USER_COOKIE = "cp_user";

/**
 * Lightweight, edge-safe gate: checks for the *presence* of a session cookie
 * and redirects to the right login page when it's missing. Real verification
 * happens server-side in `requireAdmin` / `requireUser`, which hit the DB.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!request.cookies.get(ADMIN_COOKIE)?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!request.cookies.get(USER_COOKIE)?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
