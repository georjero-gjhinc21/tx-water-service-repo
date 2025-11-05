import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Let the login page render without gating
  if (req.nextUrl.pathname.startsWith("/admin/login")) {
    return res;
  }

  // Gate all other /admin routes by our own admin session cookie
  if (req.cookies.get("admin_session")?.value === "true") {
    return res;
  }

  // Not logged in -> redirect to login, preserving intended destination
  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set(
    "redirectTo",
    req.nextUrl.pathname + (req.nextUrl.search || "")
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
