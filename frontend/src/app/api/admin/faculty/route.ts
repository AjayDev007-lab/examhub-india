import { NextRequest, NextResponse } from "next/server";
import { initialFaculty } from "@/lib/data";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "API service is not configured" }, { status: 503 });
  const token = request.cookies.get("examhub_token")?.value ||
    (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  try {
    const response = await fetch(`${backendUrl}/api/admin/faculty`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json(data, { status: response.status });
    const byEmail = new Map<string, any>();
    for (const item of initialFaculty) byEmail.set(item.email.toLowerCase(), item);
    for (const item of Array.isArray(data.faculty) ? data.faculty : []) byEmail.set(item.email.toLowerCase(), item);
    const faculty = [...byEmail.values()];
    return NextResponse.json({ total: faculty.length, faculty }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "API service is unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, "/api/admin/faculty", "admin");
}
