import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const authHeader = req.headers.get("authorization") || "";

  try {
    const res = await fetch(`${backendUrl}/api/admin/website-control/status`, {
      headers: { Authorization: authHeader },
      cache: "no-store"
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  return NextResponse.json({
    mode: "ONLINE",
    maintenance_message: "ExamHub India is currently undergoing scheduled platform upgrades to serve you better. We will be back online shortly.",
    estimated_return_time: "Tonight by 23:30 IST",
    scheduled_start_time: null,
    scheduled_end_time: null,
    auto_online_enabled: true,
    allowed_admin_ips: null,
    updated_at: new Date().toISOString(),
    last_transition: {
      previous_mode: "ONLINE",
      new_mode: "ONLINE",
      reason: "Initial system operational readiness",
      admin_email: "superadmin@examhub.gov.in",
      timestamp: new Date().toISOString()
    }
  });
}
