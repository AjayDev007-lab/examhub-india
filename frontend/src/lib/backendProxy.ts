import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SessionRole } from "@/lib/session";

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
    const upstream = await fetch(`${backendUrl}${backendPath}${query}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": request.headers.get("content-type") || "application/json" } : {}) },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
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
