import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "Status service is not configured" }, { status: 503 });
  try {
    const res = await fetch(`${backendUrl}/api/status`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ detail: "Status service is unavailable" }, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Status service is unavailable" }, { status: 503 });
  }
}
