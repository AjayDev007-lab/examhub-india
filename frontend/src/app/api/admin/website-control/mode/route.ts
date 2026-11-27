import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  const token = req.cookies.get("examhub_token")?.value;
  if (!backendUrl || !token) return NextResponse.json({ detail: "Website control service is unavailable" }, { status: 503 });
  try {
    const response = await fetch(`${backendUrl}/api/admin/website-control/mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(await req.json()),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch {
    return NextResponse.json({ detail: "Website control service is unavailable" }, { status: 503 });
  }
}
