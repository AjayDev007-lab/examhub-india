import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status_filter");

    let alerts = dbStore.adminAlerts;
    if (statusFilter && statusFilter !== "ALL") {
      alerts = alerts.filter((a: any) => a.status === statusFilter);
    }

    return NextResponse.json({ total: alerts.length, alerts });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load alerts" }, { status: 500 });
  }
}
