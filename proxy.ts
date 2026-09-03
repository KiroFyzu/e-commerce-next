import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PAGES = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  if (nextUrl.pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const isPublicPage = PUBLIC_PAGES.includes(nextUrl.pathname);

  if (!isLoggedIn && !isPublicPage) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublicPage) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  if (nextUrl.pathname.startsWith("/admin") && req.auth?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
