import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { neon } from "@neondatabase/serverless";

// Check the shared DB setting on every request: switches take effect without redeploy.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/admin/maintenance") || pathname.startsWith("/api/auth/") ||
      pathname === "/api/auth" || pathname.startsWith("/login") ||
      pathname.startsWith("/maintenance")) return NextResponse.next();

  const url = process.env.DATABASE_URL;
  if (!url) return NextResponse.next();
  const db = neon(url);
  let enabled = false;
  try {
    const rows = await db`SELECT enabled FROM site_settings WHERE key='maintenance' LIMIT 1`;
    enabled = rows[0]?.enabled === true;
  } catch (error: any) {
    if (error?.code === "42P01") return NextResponse.next();
    // Database unavailable: prevent accidentally exposing the site during maintenance.
    return new NextResponse("Service temporarily unavailable", { status: 503 });
  }
  if (!enabled) return NextResponse.next();

  // Verify role against the database, not an old JWT role claim.
  const cookieName = request.cookies.has("__Secure-authjs.session-token")
    ? "__Secure-authjs.session-token" : "authjs.session-token";
  let admin = false;
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      cookieName,
      salt: cookieName,
    });
    if (typeof token?.id === "string") {
      const rows = await db`SELECT role,banned,banned_until FROM users WHERE id=${token.id} LIMIT 1`;
      const u = rows[0];
      admin = u?.role === "admin" && !u.banned && (!u.banned_until || new Date(String(u.banned_until)) <= new Date());
    }
  } catch { admin = false; }
  if (admin) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Maintenance mode" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.redirect(new URL("/maintenance", request.url), { status: 307 });
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|webp|gif|svg|ico|woff|woff2|css|js)$).*)"],
};
