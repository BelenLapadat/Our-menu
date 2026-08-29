import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isLoginPage = nextUrl.pathname === "/login";
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");

  if (isAuthRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
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
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
