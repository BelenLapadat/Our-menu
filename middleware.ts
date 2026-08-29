import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeInternalPath } from "@/lib/safe-path";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isPublicPage =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/terminos" ||
    nextUrl.pathname === "/privacidad";

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: nextUrl.protocol === "https:",
  });
  const isLoggedIn = !!token?.userId;

  if (!isLoggedIn && !isPublicPage) {
    const callbackUrl = encodeURIComponent(
      `${nextUrl.pathname}${nextUrl.search}`,
    );
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl),
    );
  }

  if (isLoggedIn && nextUrl.pathname === "/login") {
    const redirectTo = sanitizeInternalPath(
      nextUrl.searchParams.get("callbackUrl"),
    );
    return NextResponse.redirect(new URL(redirectTo, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
