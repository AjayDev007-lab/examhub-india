import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.toUpperCase().trim();

    let reports = dbStore?.brokenReports || [];
    if (status) {
      reports = reports.filter((r) => r.status === status);
    }

    return NextResponse.json({
      reports,
      total: reports.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load reports" }, { status: 500 });
  }
}
