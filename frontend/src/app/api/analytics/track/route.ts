import { NextRequest, NextResponse } from "next/server";
import { visitorTracker } from "@/lib/visitorTracker";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { path = "/", referrer = "", screenWidth } = body;

    // Extract IP and User-Agent headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (realIp || "127.0.0.1");
    const userAgent = request.headers.get("user-agent") || "";

    const result = visitorTracker.recordHit(ip, userAgent, path, referrer, screenWidth);

    return NextResponse.json({
      success: true,
      active_visitors: result.activeVisitors,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
