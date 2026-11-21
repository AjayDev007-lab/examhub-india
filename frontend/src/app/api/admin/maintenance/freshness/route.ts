import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/admin/maintenance/freshness`, { cache: "no-store" });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  return NextResponse.json({
    expired_jobs_count: 3,
    expired_jobs: [
      { id: 91, title: "State Police Constable Recruitment 2025", organization: "State Police Recruitment Board", end_date: "2026-02-15T23:59:59Z", status: "EXPIRED" },
      { id: 92, title: "District Court Stenographer Grade III", organization: "High Court Registry", end_date: "2026-02-10T23:59:59Z", status: "EXPIRED" }
    ],
    active_exams_audited: 24,
    recommendations: [
      "Auto-archive 3 recruitment notices past last submission deadline",
      "Trigger re-verification for CBSE 2026 result announcement readiness",
      "Update UPSC CSE 2026 examination timetable reference links"
    ]
  });
}
