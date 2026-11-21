import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await request.json();
    const { status, admin_notes } = body;

    const report = (dbStore?.brokenReports || []).find((r) => r.id === id);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (status) {
      report.status = status.toUpperCase();
    }
    if (admin_notes !== undefined) {
      report.admin_notes = admin_notes;
    }

    return NextResponse.json({
      message: "Report updated successfully",
      report_id: report.id,
      status: report.status
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update report" }, { status: 500 });
  }
}
