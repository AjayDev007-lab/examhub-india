import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  const token = request.cookies.get("examhub_token")?.value;
  if (!backendUrl || !token) return NextResponse.json({ detail: "Administrator service is unavailable" }, { status: 503 });
  try {
    const response = await fetch(`${backendUrl}/api/admin/change-password`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch {
    return NextResponse.json({ detail: "Administrator service is unavailable" }, { status: 503 });
  }
}
