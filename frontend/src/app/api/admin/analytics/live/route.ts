import { NextRequest, NextResponse } from "next/server";
import { visitorTracker } from "@/lib/visitorTracker";

export async function GET(request: NextRequest) {
  try {
    const activeSessions = visitorTracker.getActiveSessions();
    const liveCount = visitorTracker.getActiveCount();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      live_active_visitors: liveCount,
      active_sessions_count: activeSessions.length,
      sessions: activeSessions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to query live sessions" }, { status: 500 });
  }
}
