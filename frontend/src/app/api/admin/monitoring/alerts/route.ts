// ============================================================================
// EXAMHUB INDIA — ADMIN MONITORING ALERTS API
// Real-time telemetry alerts ledger and resolution status
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getStoredAlerts } from "@/lib/guardianMonitoring";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const alerts = getStoredAlerts();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      alerts
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve monitoring alerts" },
      { status: 500 }
    );
  }
}
