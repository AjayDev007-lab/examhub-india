import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export function requireCronAuthorization(request: NextRequest): NextResponse | null {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret) {
    return NextResponse.json({ success: false, error: "Cron authentication is not configured" }, { status: 503 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const expected = Buffer.from(configuredSecret);
  const supplied = Buffer.from(suppliedSecret);
  const valid = expected.length === supplied.length && timingSafeEqual(expected, supplied);

  return valid
    ? null
    : NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}
