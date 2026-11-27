import { NextRequest, NextResponse } from "next/server";

async function forward(request: NextRequest, method: "GET" | "PUT") {
  const backendUrl = process.env.BACKEND_URL;
  const token = request.cookies.get("examhub_token")?.value;
  if (!backendUrl || !token) return NextResponse.json({ detail: "Administrator service is unavailable" }, { status: 503 });
  try {
    const response = await fetch(`${backendUrl}/api/admin/profile`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      ...(method === "PUT" ? { body: JSON.stringify(await request.json()) } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "Administrator service is unavailable" }, { status: 503 });
  }
}

export const GET = (request: NextRequest) => forward(request, "GET");
export const PUT = (request: NextRequest) => forward(request, "PUT");
