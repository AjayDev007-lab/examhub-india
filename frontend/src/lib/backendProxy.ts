import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SessionRole } from "@/lib/session";

export async function requireAdminSession(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get("examhub_token")?.value ||
    (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!await verifySessionToken(token, "admin")) {
    return NextResponse.json({ detail: "Administrator authentication required" }, { status: 401 });
  }
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "API service is not configured" }, { status: 503 });
  try {
    const response = await fetch(`${backendUrl.replace(/\/+$/, "")}/api/admin/me`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(20000),
    });
    if (response.ok) return null;
    if (response.status === 401 || response.status === 403) return NextResponse.json({ detail: "Administrator authentication required" }, { status: 401 });
    return NextResponse.json({ detail: "Administrator authorization is unavailable" }, { status: 503 });
  } catch {
    return NextResponse.json({ detail: "API service is unavailable" }, { status: 503 });
  }
}

/** Forward public read-only endpoints to the persistent FastAPI database. */
export async function proxyPublicBackendRequest(
  request: NextRequest,
  backendPath: string,
  method: string = request.method,
  query: string = request.nextUrl.search,
  forwardOptionalAuth = false,
): Promise<NextResponse> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "API service is not configured" }, { status: 503 });

  try {
    const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
    const optionalToken = forwardOptionalAuth
      ? request.cookies.get("examhub_token")?.value || (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")
      : "";
    const upstream = await fetch(`${backendUrl.replace(/\/+$/, "")}${backendPath}${query}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": request.headers.get("content-type") || "application/json" } : {}),
        ...(optionalToken ? { Authorization: `Bearer ${optionalToken}` } : {}),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    const headers = new Headers();
    for (const name of ["content-type", "content-disposition", "cache-control"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set("Cache-Control", "no-store");
    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch {
    return NextResponse.json({ detail: "API service is unavailable" }, { status: 503 });
  }
}

/** Forward authenticated browser calls to the private API without exposing API credentials. */
export async function proxyBackendRequest(
  request: NextRequest,
  backendPath: string,
  role: SessionRole,
  method: string = request.method,
  query: string = request.nextUrl.search,
): Promise<NextResponse> {
  const backendUrl = process.env.BACKEND_URL;
  const token = request.cookies.get("examhub_token")?.value || (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!backendUrl) return NextResponse.json({ detail: "API service is not configured" }, { status: 503 });
  if (!await verifySessionToken(token, role)) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });

  try {
    const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
    const upstream = await fetch(`${backendUrl.replace(/\/+$/, "")}${backendPath}${query}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": request.headers.get("content-type") || "application/json" } : {}) },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    const headers = new Headers();
    for (const name of ["content-type", "content-disposition", "cache-control"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set("Cache-Control", "no-store");
    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch {
    return NextResponse.json({ detail: "API service is unavailable" }, { status: 503 });
  }
}
