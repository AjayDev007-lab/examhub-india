import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory / edge status check helper
let cachedMode = "ONLINE";
let lastCheck = 0;

async function getOperatingMode(req: NextRequest): Promise<{ mode: string; message?: string; estimated_return?: string }> {
  const now = Date.now();
  // Cache for 5 seconds to minimize latency
  if (now - lastCheck < 5000 && cachedMode) {
    return { mode: cachedMode };
  }

  try {
    const origin = req.nextUrl.origin;
    const res = await fetch(`${origin}/api/status`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      cachedMode = data.mode || "ONLINE";
      lastCheck = now;
      return {
        mode: cachedMode,
        message: data.maintenance_message,
        estimated_return: data.estimated_return_time
      };
    }
  } catch (_) {}

  return { mode: cachedMode };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow Next.js internals, static assets, and images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Always allow Administrative routes and recovery mechanisms
  // Super Admin can NEVER be locked out of the administration console
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/status") ||
    pathname === "/maintenance" ||
    pathname === "/offline"
  ) {
    return NextResponse.next();
  }

  // 3. Check for Admin Bypass Cookie / Header
  const bypassCookie = request.cookies.get("examhub_maintenance_bypass");
  const bypassHeader = request.headers.get("x-examhub-bypass");
  if (bypassCookie?.value === "true" || bypassHeader === "true") {
    return NextResponse.next();
  }

  // 4. Check Current Operating Mode
  const { mode, message, estimated_return } = await getOperatingMode(request);

  if (mode === "MAINTENANCE") {
    // Return 503 for API requests
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "Service Unavailable",
          mode: "MAINTENANCE",
          message: message || "ExamHub India is currently undergoing scheduled platform upgrades.",
          estimated_return_time: estimated_return || "Shortly"
        },
        {
          status: 503,
          headers: { "Retry-After": "300" }
        }
      );
    }
    // Rewrite browser page to /maintenance
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  if (mode === "OFFLINE") {
    // Return 503 for API requests
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "Service Temporarily Unavailable",
          mode: "OFFLINE",
          message: "ExamHub India is currently offline for critical administrative maintenance."
        },
        {
          status: 503,
          headers: { "Retry-After": "600" }
        }
      );
    }
    // Rewrite browser page to /offline
    return NextResponse.rewrite(new URL("/offline", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
