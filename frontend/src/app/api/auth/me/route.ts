import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  const token = request.cookies.get("examhub_token")?.value || "";
  if (!backendUrl) return NextResponse.json({ detail: "Authentication service is not configured" }, { status: 503 });
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  try {
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "Authentication service is unavailable" }, { status: 503 });
  }
}
