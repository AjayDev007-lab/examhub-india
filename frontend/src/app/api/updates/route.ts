import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "Updates service is not configured" }, { status: 503 });
  try {
    const res = await fetch(`${backendUrl}/api/updates${req.nextUrl.search}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "Updates service is unavailable" }, { status: 503 });
  }
}
