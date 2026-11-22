import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

// In-memory rate limiting and token cache for password resets
const resetAttempts: Record<string, { lastAttempt: number; count: number; token?: string; expiresAt?: number }> = {};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body.identifier || "").trim().toLowerCase();

    if (!identifier) {
      return NextResponse.json(
        { detail: "Please enter your registered email address or mobile number." },
        { status: 400 }
      );
    }

    // Rate limiting: maximum 3 requests per 5 minutes per identifier
    const now = Date.now();
    const userLimit = resetAttempts[identifier] || { lastAttempt: 0, count: 0 };
    if (now - userLimit.lastAttempt < 5 * 60 * 1000 && userLimit.count >= 3) {
      return NextResponse.json(
        { detail: "Too many reset requests. Please wait 5 minutes before trying again." },
        { status: 429 }
      );
    }

    // Try FastAPI backend if running
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
        signal: AbortSignal.timeout(2000),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch (_) {
      // Backend not running; proceed locally
    }

    // Standalone handling
    const student = (dbStore.students || []).find(
      (s: any) => s.email?.toLowerCase() === identifier || s.mobile === identifier
    );
    const admin = (dbStore as any).adminProfile;
    const isAdmin = admin && (admin.email?.toLowerCase() === identifier || identifier === "superadmin@examhub.gov.in");

    // Generate secure 6-digit OTP and reset token
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = "reset_token_" + Buffer.from(`${identifier}:${randomOtp}:${now}`).toString("base64url");
    const expiresAt = now + 15 * 60 * 1000; // 15 minutes expiry

    resetAttempts[identifier] = {
      lastAttempt: now,
      count: (userLimit.count || 0) + 1,
      token: resetToken,
      expiresAt: expiresAt,
    };

    const hasAccount = Boolean(student || isAdmin);

    return NextResponse.json({
      success: true,
      message: hasAccount
        ? `A 6-digit verification OTP has been generated for your registered credentials.`
        : "If an account matches your details, recovery instructions have been dispatched.",
      recovery_token: hasAccount ? resetToken : undefined,
      debug_reset_token: hasAccount ? resetToken : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Request failed" }, { status: 500 });
  }
}
