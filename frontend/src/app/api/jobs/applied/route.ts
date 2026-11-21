import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET() {
  try {
    const applications = (dbStore as any).jobApplications || [];
    const jobs = (dbStore as any).jobs || [];

    const userApps = applications.filter((a: any) => a.userId === 1);
    const enriched = userApps
      .map((a: any) => {
        const job = jobs.find((j: any) => j.id === a.jobId);
        if (!job) return null;
        return {
          application_id: a.id,
          job_id: job.id,
          title: job.title,
          slug: job.slug,
          organization_name: job.organization_name,
          category: job.category,
          salary_range: job.salary_range,
          location: job.location,
          application_status: a.status,
          application_number: a.application_number,
          notes: a.notes,
          applied_at: a.appliedAt,
          official_application_url: job.official_application_url
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      total: enriched.length,
      applications: enriched
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
