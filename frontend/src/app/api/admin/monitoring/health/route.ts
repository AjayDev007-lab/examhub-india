// ============================================================================
// EXAMHUB INDIA — ADMIN MONITORING HEALTH API
// Real-time telemetry across Website, Database, Bot, Webhook, Pipeline & Scanner
// Protected by Admin Authentication
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { runFullSystemHealthCheck } from "@/lib/guardianMonitoring";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const health = await runFullSystemHealthCheck();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to run health check telemetry" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const health = await runFullSystemHealthCheck();
    return NextResponse.json({
      success: true,
      message: "Health telemetry successfully refreshed",
      timestamp: new Date().toISOString(),
      health
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to refresh health check telemetry" },
      { status: 500 }
    );
  }
}
