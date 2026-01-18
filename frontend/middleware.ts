// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("adminToken")?.value;

//   // ✅ Protect admin dashboard
//   if (req.nextUrl.pathname.startsWith("/admin_dash")) {
//     if (!token) {
//       // ✅ Redirect to homepage (localhost:3000)
//       return NextResponse.redirect(new URL("/", req.url));
//     }

//     try {
//       const decoded = JSON.parse(
//         Buffer.from(token.split(".")[1], "base64").toString()
//       );

//       if (decoded.role?.toLowerCase() !== "admin") {
//         return NextResponse.redirect(new URL("/", req.url));
//       }
//     } catch {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin_dash/:path*", "/admin_dash"],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const sessionVisible = req.cookies.get("adminSessionVisible")?.value;

  console.log("🧪 Middleware check → adminSessionVisible:", sessionVisible);

  // ✅ Protect admin dashboard
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
