import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      const next = encodeURIComponent(path);
      return NextResponse.redirect(new URL(`/login?next=${next}`, request.url));
    }
  }

  if (path.startsWith("/account") || path.startsWith("/pet-feed")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // 主任账户功能区：管理员请走 /admin
    if (path.startsWith("/account") && token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/account/:path*", "/pet-feed/:path*"],
};
