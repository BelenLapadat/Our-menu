import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

function sanitizeCallbackPath(value: string | null) {
  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/";
}

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isLoginPage = nextUrl.pathname === "/login";

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: nextUrl.protocol === "https:",
  });
  const isLoggedIn = !!token?.userId;

  if (!isLoggedIn && !isLoginPage) {
    const callbackUrl = encodeURIComponent(
      `${nextUrl.pathname}${nextUrl.search}`,
    );
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl),
    );
  }

  if (isLoggedIn && isLoginPage) {
    const redirectTo = sanitizeCallbackPath(
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
