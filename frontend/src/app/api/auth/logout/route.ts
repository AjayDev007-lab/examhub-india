import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("examhub_token")?.value;
  const backendUrl = process.env.BACKEND_URL;
  if (token && backendUrl) {
    try {
      await fetch(`${backendUrl}/api/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(5000) });
    } catch { /* Cookie is cleared even if revocation service is unreachable. */ }
  }
  const response = NextResponse.json({
    success: true,
    message: "Successfully logged out"
  });
  response.cookies.set("examhub_token", "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return response;
}
