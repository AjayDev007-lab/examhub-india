import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const jobs = (dbStore as any).jobs || [];
    const job = jobs.find((j: any) => j.slug === slug.toLowerCase() || String(j.id) === slug);

    if (!job) {
      return NextResponse.json({ error: "Job notification not found" }, { status: 404 });
    }

    const reports = (dbStore as any).jobReports || [];
    reports.push({
      id: Date.now(),
      jobId: job.id,
      userId: 1,
      reporter_email: body.reporter_email || "student@examhub.gov.in",
      issue_type: body.issue_type || "OTHER",
      details: body.details || "",
      status: "PENDING",
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Your report has been submitted to our job verification desk."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
