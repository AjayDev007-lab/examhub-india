import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json().catch(() => ({}));
    const jobs = (dbStore as any).jobs || [];
    const job = jobs.find((j: any) => j.slug === slug.toLowerCase() || String(j.id) === slug);

    if (!job) {
      return NextResponse.json({ error: "Job notification not found" }, { status: 404 });
    }

    // Increment click counter
    job.apply_clicks_count = (job.apply_clicks_count || 0) + 1;

    // Track application
    const applications = (dbStore as any).jobApplications || [];
    const existing = applications.find((a: any) => a.jobId === job.id && a.userId === 1);

    if (!existing) {
      applications.push({
        id: Date.now(),
        userId: 1,
        jobId: job.id,
        status: "APPLIED",
        application_number: body.application_number || null,
        notes: body.notes || "Applied via official recruitment portal link.",
        appliedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      redirect_url: job.official_application_url,
      message: "Application tracked and redirecting to official portal"
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
