import { NextRequest, NextResponse } from "next/server";
import { visitorTracker } from "@/lib/visitorTracker";

export async function GET(request: NextRequest) {
  try {
    const csvContent = visitorTracker.generateCsvExport();
    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=examhub_analytics_report_${dateStr}.csv`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to export CSV" }, { status: 500 });
  }
}
