import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "Mobile OTP delivery is not configured" }, { status: 503 });
  try {
    const response = await fetch(`${backendUrl}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json(data, { status: response.status });
    if (!data.access_token || data.user_type !== "student") return NextResponse.json({ detail: "Invalid session response" }, { status: 502 });
    const result = NextResponse.json({ user_type: "student", user: data.user });
    result.cookies.set("examhub_token", data.access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 86400 });
    return result;
  } catch (err: any) {
    return NextResponse.json({ detail: "OTP verification service is unavailable" }, { status: 503 });
  }
}
