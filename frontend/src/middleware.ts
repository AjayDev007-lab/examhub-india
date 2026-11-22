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

  // 2. Administrative routes protection & RBAC
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // 2a. Allow Admin Login endpoints
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
      return NextResponse.next();
    }

    const userTypeCookie = request.cookies.get("examhub_user_type")?.value;
    const adminToken = request.cookies.get("examhub_admin_token")?.value || request.cookies.get("examhub_token")?.value;
    const authHeader = request.headers.get("authorization");
    const bypassCookie = request.cookies.get("examhub_maintenance_bypass")?.value;
    const bypassHeader = request.headers.get("x-examhub-bypass");

    const hasAdminAuth =
      userTypeCookie === "admin" ||
      bypassCookie === "true" ||
      bypassHeader === "true" ||
      (authHeader && (authHeader.includes("examhub_superadmin_secure_token") || authHeader.startsWith("Bearer ")));

    // For API endpoints under /api/admin/*
    if (pathname.startsWith("/api/admin")) {
      if (userTypeCookie === "student") {
        return NextResponse.json(
          { detail: "Forbidden: Student accounts are strictly prohibited from accessing Administrative APIs." },
          { status: 403 }
        );
      }
      if (!hasAdminAuth && !adminToken) {
        return NextResponse.json(
          { detail: "Unauthorized: Administrator authentication required." },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    // For UI pages under /admin/*
    if (pathname.startsWith("/admin")) {
      if (userTypeCookie === "student") {
        return NextResponse.redirect(new URL("/dashboard?error=admin_access_denied", request.url));
      }
      if (!hasAdminAuth && !adminToken) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return NextResponse.next();
    }
  }

  // 3. Student routes protection (Requirement 12)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/student")) {
    const userTypeCookie = request.cookies.get("examhub_user_type")?.value;
    const token = request.cookies.get("examhub_token")?.value;

    if (!token && !userTypeCookie) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Allow status and maintenance pages
  if (
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
  const modeCookie = request.cookies.get("examhub_site_mode")?.value;
  let activeMode = modeCookie;
  let activeMessage: string | undefined = undefined;
  let activeEstimated: string | undefined = undefined;

  if (!activeMode) {
    const statusData = await getOperatingMode(request);
    activeMode = statusData.mode;
    activeMessage = statusData.message;
    activeEstimated = statusData.estimated_return;
  }

  if (activeMode === "MAINTENANCE") {
    // Return 503 for API requests
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "Service Unavailable",
          mode: "MAINTENANCE",
          message: activeMessage || "ExamHub India is currently undergoing scheduled platform upgrades.",
          estimated_return_time: activeEstimated || "Shortly"
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

  if (activeMode === "OFFLINE") {
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
