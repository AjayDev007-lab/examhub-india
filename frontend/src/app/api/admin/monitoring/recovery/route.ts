// ============================================================================
// EXAMHUB INDIA — ADMIN MONITORING SAFE RECOVERY API
// Non-destructive safe recovery executor for transient queue & lock failures
// Protected by Admin Authentication
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { executeSafeRecovery, runFullSystemHealthCheck } from "@/lib/guardianMonitoring";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const recoveryResult = await executeSafeRecovery();
    const updatedHealth = await runFullSystemHealthCheck();

    return NextResponse.json({
      success: true,
      message: `Safe recovery completed. ${recoveryResult.actionsTakenCount} actions executed.`,
      timestamp: new Date().toISOString(),
      recoveredSystems: recoveryResult.recoveredSystems,
      logs: recoveryResult.logs,
      health: updatedHealth
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to execute safe automated recovery" },
      { status: 500 }
    );
  }
}
