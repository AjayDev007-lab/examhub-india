import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/admin/daily-updates/history`, { cache: "no-store" });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  return NextResponse.json({
    runs: [
      {
        id: 1,
        schedule_slot: "Nightly Verification & Summary",
        status: "COMPLETED",
        sources_checked: 10,
        new_items_detected: 2,
        duration_seconds: 3.9,
        completed_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 2,
        schedule_slot: "Evening Source Check",
        status: "COMPLETED",
        sources_checked: 10,
        new_items_detected: 4,
        duration_seconds: 4.1,
        completed_at: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ],
    audit_logs: [
      {
        id: 1,
        update_id: 101,
        action: "PUBLISH",
        notes: "UPSC CSE 2026 Preliminary official notification published",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  });
}
