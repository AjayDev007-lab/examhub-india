import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "Authentication service is not configured" }, { status: 503 });
  try {
    const body = await request.json();
    const legacyToken = request.cookies.get("examhub_token")?.value;
    const response = await fetch(`${backendUrl}/api/auth/firebase-exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(legacyToken ? { Authorization: `Bearer ${legacyToken}` } : {}) },
      body: JSON.stringify({ id_token: body.id_token }), cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json(data, { status: response.status });
    if (!data.access_token || !["student", "admin"].includes(data.user_type)) {
      return NextResponse.json({ detail: "Authentication service returned an invalid session" }, { status: 502 });
    }
    const isAdmin = data.user_type === "admin";
    const result = NextResponse.json(
      { user_type: data.user_type, user: data.user },
      { headers: { "Cache-Control": "no-store" } },
    );
    result.cookies.set("examhub_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: isAdmin ? "strict" : "lax",
      path: "/",
      maxAge: isAdmin ? 60 * 60 * 8 : 60 * 60 * 24,
    });
    return result;
  } catch {
    return NextResponse.json({ detail: "Authentication service is unavailable" }, { status: 503 });
  }
}
