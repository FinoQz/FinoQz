import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const sessionVisible = req.cookies.get("adminSessionVisible")?.value;

  console.log("🧪 Middleware check → adminSessionVisible:", sessionVisible);

  if (req.nextUrl.pathname.startsWith("/admin_dash")) {
    if (!sessionVisible || sessionVisible !== "true") {
      console.warn("❌ Redirecting: No valid session cookie");
      return NextResponse.redirect(new URL("/", req.url));
    }

    console.log("✅ Access granted to admin dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin_dash/:path*", "/admin_dash"],
};
