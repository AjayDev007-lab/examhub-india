import { NextResponse, NextRequest } from "next/server";
import { INITIAL_MONITORING_SOURCES, MonitoringSource } from "@/lib/dailyUpdatesData";

let sourcesStore = [...INITIAL_MONITORING_SOURCES];

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/admin/daily-updates/sources${req.nextUrl.search}`, { cache: "no-store" });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  const category = req.nextUrl.searchParams.get("category");
  let filtered = sourcesStore;
  if (category && category !== "ALL") {
    filtered = filtered.filter(s => s.category === category);
  }
  return NextResponse.json({ total: filtered.length, sources: filtered });
}

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const body = await req.json();
  try {
    const res = await fetch(`${backendUrl}/api/admin/daily-updates/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  const newSource: MonitoringSource = {
    id: sourcesStore.length + 1,
    name: body.name,
    organization_code: body.organization_code,
    organization_name: body.organization_name,
    category: body.category,
    state_code: body.state_code || "ALL",
    source_type: body.source_type || "OFFICIAL_GOVT",
    official_website_url: body.official_website_url,
    notification_url: body.notification_url,
    verification_status: "VERIFIED",
    check_frequency: body.check_frequency || "DAILY",
    is_enabled: true,
    priority: body.priority || 1,
    last_checked_at: new Date().toISOString(),
    last_successful_check_at: new Date().toISOString()
  };
  sourcesStore.push(newSource);
  return NextResponse.json({ success: true, source_id: newSource.id, message: "Source registered successfully" });
}
