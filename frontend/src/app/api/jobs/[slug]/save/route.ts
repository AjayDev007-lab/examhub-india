import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const jobs = (dbStore as any).jobs || [];
    const job = jobs.find((j: any) => j.slug === slug.toLowerCase() || String(j.id) === slug);

    if (!job) {
      return NextResponse.json({ error: "Job notification not found" }, { status: 404 });
    }

    const savedJobs = (dbStore as any).savedJobs || [];
    const existingIndex = savedJobs.findIndex((s: any) => s.jobId === job.id && s.userId === 1);

    if (existingIndex !== -1) {
      savedJobs.splice(existingIndex, 1);
      return NextResponse.json({ saved: false, message: "Job removed from saved bookmarks" });
    } else {
      savedJobs.push({ userId: 1, jobId: job.id, createdAt: new Date().toISOString() });
      return NextResponse.json({ saved: true, message: "Job saved to your career bookmarks" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
