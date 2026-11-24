import { NextResponse, NextRequest } from "next/server";
import { INITIAL_DETECTED_UPDATES } from "@/lib/dailyUpdatesData";
import { processAndAutoPublishJob } from "@/lib/aiJobVerification";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  try {
    const res = await fetch(`${backendUrl}/api/admin/daily-updates/updates/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  let broadcastResult = null;
  const newStatus = body.action === "APPROVE" ? "APPROVED" : body.action === "PUBLISH" ? "PUBLISHED" : "REJECTED";

  // If approved or published, trigger autonomous publishing pipeline
  if (newStatus === "PUBLISHED" || newStatus === "APPROVED") {
    const item = INITIAL_DETECTED_UPDATES.find(u => String(u.id) === String(id)) || {
      id: parseInt(id),
      title: body.title || "Government Recruitment Update",
      organization: body.organization || "Official Board",
      category: "GOV_JOB",
      state: "ALL_INDIA",
      detected_at: new Date().toISOString(),
      official_application_url: "https://upsconline.nic.in",
      application_end_date: "2026-03-05"
    };

    broadcastResult = await processAndAutoPublishJob(item, { forcePublishTest: true });
  }

  return NextResponse.json({
    success: true,
    update_id: parseInt(id),
    status: newStatus,
    broadcast: broadcastResult
  });
}
