import { NextRequest, NextResponse } from "next/server";
import { initialITJobs } from "@/lib/platformData";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "API service is not configured" }, { status: 503 });

  try {
    const response = await fetch(`${backendUrl}/api/it-jobs?limit=200`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json(data, { status: response.status });

    // Keep the published starter catalogue visible while all administrator
    // additions and changes are stored in the backend database.
    const jobsBySlug = new Map<string, any>();
    for (const job of initialITJobs) jobsBySlug.set(job.slug, job);
    for (const job of Array.isArray(data.jobs) ? data.jobs : []) jobsBySlug.set(job.slug, job);
    let jobs = [...jobsBySlug.values()];

    const params = request.nextUrl.searchParams;
    const category = params.get("category");
    const experience = params.get("experience");
    const workMode = params.get("work_mode");
    const location = params.get("location");
    const search = params.get("search")?.trim().toLowerCase();
    const limit = Math.max(1, Math.min(Number(params.get("limit") || 50), 200));

    if (category && category !== "ALL") jobs = jobs.filter((job: any) => job.category === category);
    if (experience && experience !== "ALL") jobs = jobs.filter((job: any) => job.experience_level === experience);
    if (workMode && workMode !== "ALL") jobs = jobs.filter((job: any) => job.work_mode === workMode);
    if (location && location !== "ALL") jobs = jobs.filter((job: any) => String(job.location || "").toLowerCase().includes(location.toLowerCase()));
    if (search) jobs = jobs.filter((job: any) =>
      [job.title, job.company_name, job.location, ...(job.required_skills || [])]
        .some((value: unknown) => String(value || "").toLowerCase().includes(search)),
    );

    return NextResponse.json({ success: true, total: jobs.length, jobs: jobs.slice(0, limit) }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ detail: "API service is unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, "/api/it-jobs", "admin");
}
