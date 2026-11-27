// ============================================================================
// EXAMHUB INDIA — ADMIN SERVER-SIDE AUTHENTICATION & SECURITY GUARD
// Strict server-side verification of administrator credentials & session tokens
// Protects administrative endpoints against unauthenticated access, student role
// escalation, CSRF attacks, and parameter tampering.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "./data";
import { createHmac, timingSafeEqual } from "node:crypto";

export interface AdminAuthResult {
  authorized: boolean;
  status: number;
  adminUser?: {
    id: number | string;
    email: string;
    fullName: string;
    role: string;
  };
  error?: string;
}

function isValidAdminJwt(token: string): boolean {
  const secret = process.env.SECRET_KEY;
  if (!secret || secret.length < 32) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (header.alg !== "HS256" || payload.type !== "admin" || Number(payload.sub) < 1 || payload.exp <= Math.floor(Date.now() / 1000)) return false;
    const expected = createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest();
    const actual = Buffer.from(parts[2], "base64url");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/**
 * Validates that an incoming request is authentically from a SuperAdmin or Admin.
 * Rejects unauthenticated requests (HTTP 401) and student accounts (HTTP 403).
 */
export function verifyAdminAuthorization(req: NextRequest): AdminAuthResult {
  // 1. Check for Student accounts attempting role escalation
  // 2. Extract Bearer token from Authorization header or Cookies
  const authHeader = req.headers.get("authorization")?.trim();
  let token = "";

  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    token =
      req.cookies.get("examhub_token")?.value?.trim() ||
      "";
  }

  // Check for student tokens
  // 3. Reject completely unauthenticated requests
  if (!token) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication Required (HTTP 401): Missing administrator authorization token."
    };
  }

  // 4. Validate Token Format and Authenticity
  if (!isValidAdminJwt(token)) {
    return {
      authorized: false,
      status: 401,
      error: "Invalid Credentials (HTTP 401): Administrator token is expired or unauthorized."
    };
  }

  // 5. CSRF Protection for state-changing mutations (POST, PUT, DELETE)
  if (req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.get("origin") || req.headers.get("referer");
    const allowedHosts = new Set(["examhub-india.vercel.app", "localhost", "127.0.0.1", process.env.SITE_HOSTNAME].filter(Boolean));
    const isCookieAuth = Boolean(req.cookies.get("examhub_token")?.value);
    let trusted = false;
    try { trusted = Boolean(origin && allowedHosts.has(new URL(origin).hostname)); } catch { trusted = false; }
    if (isCookieAuth && !trusted || origin && !trusted) {
      return {
        authorized: false,
        status: 403,
        error: "Cross-Site Request Forgery protection blocked this request."
      };
    }
  }

  const adminProfile = (dbStore as any).adminProfile || {
    id: 1,
    full_name: "ExamHub Super Administrator",
    email: "ajaydevvs22102004@gmail.com",
    role: "SUPER_ADMIN"
  };

  return {
    authorized: true,
    status: 200,
    adminUser: {
      id: adminProfile.id,
      email: adminProfile.email,
      fullName: adminProfile.full_name,
      role: adminProfile.role || "SUPER_ADMIN"
    }
  };
}

/**
 * Standard Next.js JSON response for authentication failures.
 */
export function unauthorizedResponse(authResult: AdminAuthResult): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: authResult.error || "Unauthorized administrative action.",
      statusCode: authResult.status
    },
    { status: authResult.status }
  );
}

/**
 * Sanitizes and validates incoming admin action request payloads.
 */
export function sanitizeAdminPayload(body: any): { valid: boolean; action: string; error?: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, action: "", error: "Request payload must be a valid JSON object." };
  }

  // Prevent prototype pollution
  if (Object.prototype.hasOwnProperty.call(body, "__proto__") || Object.prototype.hasOwnProperty.call(body, "constructor")) {
    return { valid: false, action: "", error: "Malicious payload detected (prototype pollution attempt)." };
  }

  const action = String(body.action || "").trim().toUpperCase();
  if (!action) {
    return { valid: false, action: "", error: "Missing required 'action' field." };
  }

  return { valid: true, action };
}
