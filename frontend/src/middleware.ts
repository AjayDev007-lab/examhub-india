import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";

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
  const isPublicAsset = /\.[a-z0-9]+$/i.test(pathname) && !pathname.startsWith("/api/");
  const authHeader = request.headers.get("authorization") || "";
  const adminToken = request.cookies.get("examhub_token")?.value || authHeader.replace(/^Bearer\s+/i, "");
  const adminSession = await verifySessionToken(adminToken, "admin");

  // 1. Always allow Next.js internals, static assets, and images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    isPublicAsset ||
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

    // For API endpoints under /api/admin/*
    if (pathname.startsWith("/api/admin")) {
      if (pathname === "/api/admin/login") return NextResponse.next();
      if (!adminSession) {
        return NextResponse.json(
          { detail: "Unauthorized: Administrator authentication required." },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    // For UI pages under /admin/*
    if (pathname.startsWith("/admin")) {
      if (!adminSession) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return NextResponse.next();
    }
  }

  // 3. Student routes protection (Requirement 12)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/student")) {
    const token = request.cookies.get("examhub_token")?.value;
    const studentSession = await verifySessionToken(token, "student");
    if (!studentSession) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  if (
    pathname.startsWith("/api/student/") ||
    pathname === "/api/jobs/saved" ||
    pathname === "/api/jobs/applied" ||
    /^\/api\/jobs\/[^/]+\/(save|apply)$/.test(pathname)
  ) {
    const token = request.cookies.get("examhub_token")?.value || (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const studentSession = await verifySessionToken(token, "student");
    if (!studentSession) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }
  }

  if (pathname === "/api/auth/me") {
    const token = request.cookies.get("examhub_token")?.value || authHeader.replace(/^Bearer\s+/i, "");
    if (!await verifySessionToken(token, "student")) {
      return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
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
  if (adminSession) {
    return NextResponse.next();
  }

  // 4. Check Current Operating Mode
  let activeMode: string | undefined;
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
