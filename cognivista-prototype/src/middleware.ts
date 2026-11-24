import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // 兼容部分 Windows 浏览器协议处理器在 URL 末尾误拼接 --proxy-pac-url 参数的情况
  if (
    pathname.includes("--proxy-pac-url") ||
    pathname.startsWith("/%20") ||
    pathname.startsWith("/ ")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
