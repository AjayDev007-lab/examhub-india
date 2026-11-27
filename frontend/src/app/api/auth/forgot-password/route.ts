import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "Account recovery is not configured" }, { status: 503 });
  try {
    const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json().catch(() => ({}));
    delete data.debug_reset_token;
    delete data.debug_token;
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ detail: "Account recovery service is unavailable" }, { status: 503 });
  }
}
