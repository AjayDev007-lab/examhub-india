import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET() {
  try {
    const savedJobs = (dbStore as any).savedJobs || [];
    const jobs = (dbStore as any).jobs || [];

    const userSaved = savedJobs.filter((s: any) => s.userId === 1);
    const enriched = userSaved
      .map((s: any) => {
        const job = jobs.find((j: any) => j.id === s.jobId);
        if (!job) return null;
        return {
          ...job,
          is_saved: true,
          saved_at: s.createdAt
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      total: enriched.length,
      jobs: enriched
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
