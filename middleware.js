import { NextResponse } from "next/server";

export const config = {
  matcher: "/chatgpt/:path*",
};

export function middleware(request) {
  return NextResponse.rewrite(new URL("/api", request.url));
}
