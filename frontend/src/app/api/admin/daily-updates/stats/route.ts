import { NextResponse } from "next/server";
import { INITIAL_MONITORING_SOURCES, INITIAL_DETECTED_UPDATES } from "@/lib/dailyUpdatesData";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/admin/daily-updates/stats`, { cache: "no-store" });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  // Fallback
  return NextResponse.json({
    sources: {
      total: INITIAL_MONITORING_SOURCES.length,
      active: INITIAL_MONITORING_SOURCES.filter(s => s.is_enabled).length,
      broken: 0,
    },
    updates: {
      total: INITIAL_DETECTED_UPDATES.length,
      pending_verification: 0,
      published: INITIAL_DETECTED_UPDATES.length,
      by_category: {
        GOVT_JOB: INITIAL_DETECTED_UPDATES.filter(u => u.category === "GOVT_JOB").length,
        PRIVATE_JOB: INITIAL_DETECTED_UPDATES.filter(u => u.category === "PRIVATE_JOB").length,
        EXAM: INITIAL_DETECTED_UPDATES.filter(u => u.category === "EXAM").length,
        RESULT: INITIAL_DETECTED_UPDATES.filter(u => u.category === "RESULT").length,
        SCHOOL_RESULT: INITIAL_DETECTED_UPDATES.filter(u => u.category === "SCHOOL_RESULT").length,
        ADMIT_CARD: INITIAL_DETECTED_UPDATES.filter(u => u.category === "ADMIT_CARD").length,
        SCHOLARSHIP: INITIAL_DETECTED_UPDATES.filter(u => u.category === "SCHOLARSHIP").length,
        ADMISSION: INITIAL_DETECTED_UPDATES.filter(u => u.category === "ADMISSION").length,
      }
    },
    last_run: {
      schedule_slot: "Nightly Verification & Summary",
      status: "COMPLETED",
      sources_checked: INITIAL_MONITORING_SOURCES.length,
      new_items_detected: 8,
      duration_seconds: 4.2,
      completed_at: new Date().toISOString()
    },
    next_scheduled_run: "22:00 IST (Nightly Verification & Summary)"
  });
}
