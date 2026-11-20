import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { website_id, reporter_name, reporter_email, reported_issue, details } = body;

    if (!website_id || !reported_issue) {
      return NextResponse.json({ error: "Missing required fields: website_id, reported_issue" }, { status: 400 });
    }

    const website = (dbStore?.officialWebsites || []).find((w) => w.id === Number(website_id));

    const newReport = {
      id: (dbStore?.brokenReports?.length || 0) + 1,
      website_id: Number(website_id),
      website_name: website ? website.name : "Unknown",
      website_url: website ? website.official_url : "",
      reported_issue,
      reporter_name: reporter_name || "Anonymous Visitor",
      reporter_email: reporter_email || null,
      details: details || null,
      status: "PENDING",
      admin_notes: "",
      created_at: new Date().toISOString()
    };

    if (!dbStore?.brokenReports) {
      if (dbStore) dbStore.brokenReports = [];
    }
    dbStore?.brokenReports.unshift(newReport);

    return NextResponse.json({
      success: true,
      message: "Thank you. Your report has been submitted to ExamHub administrators for official verification.",
      report_id: newReport.id
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit report" }, { status: 500 });
  }
}
