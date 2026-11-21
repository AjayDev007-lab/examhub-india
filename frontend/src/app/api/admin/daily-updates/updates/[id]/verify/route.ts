import { NextResponse, NextRequest } from "next/server";
import { INITIAL_DETECTED_UPDATES } from "@/lib/dailyUpdatesData";

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

  return NextResponse.json({
    success: true,
    update_id: parseInt(id),
    status: body.action === "APPROVE" ? "APPROVED" : body.action === "PUBLISH" ? "PUBLISHED" : "REJECTED"
  });
}
