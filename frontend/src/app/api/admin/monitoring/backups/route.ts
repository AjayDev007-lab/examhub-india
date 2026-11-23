// ============================================================================
// EXAMHUB INDIA — ADMIN MONITORING BACKUPS API
// Non-destructive snapshot backup creator & verification endpoint
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createSafeBackupSnapshot, getStoredBackups } from "@/lib/guardianMonitoring";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const snapshots = getStoredBackups();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      snapshots
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve snapshot backups" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await createSafeBackupSnapshot();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Verified non-destructive snapshot created successfully",
      timestamp: new Date().toISOString(),
      snapshot: result.snapshot
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to generate safe backup snapshot" },
      { status: 500 }
    );
  }
}
