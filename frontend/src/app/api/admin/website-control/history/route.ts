import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  const token = request.cookies.get("examhub_token")?.value;
  if (!backendUrl || !token) return NextResponse.json({ detail: "Website control service is unavailable" }, { status: 503 });
  try {
    const response = await fetch(`${backendUrl}/api/admin/website-control/history`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ detail: "Website control service is unavailable" }, { status: 503 }); }
}
