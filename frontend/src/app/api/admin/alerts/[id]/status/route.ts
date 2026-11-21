import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alertId = parseInt(id);
    const body = await request.json();

    const alert = dbStore.adminAlerts.find((a: any) => a.id === alertId);
    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    alert.status = body.status;
    return NextResponse.json({ success: true, alert_id: alertId, status: alert.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
