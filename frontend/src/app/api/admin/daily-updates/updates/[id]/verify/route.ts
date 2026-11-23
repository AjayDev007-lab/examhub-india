import { NextResponse, NextRequest } from "next/server";
import { INITIAL_DETECTED_UPDATES } from "@/lib/dailyUpdatesData";
import { sendTelegramChannelPost, formatJobTelegramPost } from "@/lib/telegramManager";

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

  // If approved or published, broadcast to public channel @india102210
  if (newStatus === "PUBLISHED" || newStatus === "APPROVED") {
    const item = INITIAL_DETECTED_UPDATES.find(u => String(u.id) === String(id)) || {
      id: parseInt(id),
      title: body.title || "Government Recruitment Update",
      organization: body.organization || "Official Board",
      category: "GOV_JOB",
      state: "ALL_INDIA",
      detected_at: new Date().toISOString()
    };

    const postHtml = formatJobTelegramPost(item);
    broadcastResult = await sendTelegramChannelPost(postHtml, {
      customChannel: "@india102210"
    });
  }

  return NextResponse.json({
    success: true,
    update_id: parseInt(id),
    status: newStatus,
    broadcast: broadcastResult
  });
}
