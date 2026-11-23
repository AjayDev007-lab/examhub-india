import { NextRequest, NextResponse } from "next/server";
import { initialITJobs, ITJobItem } from "@/lib/platformData";
import { dbStore } from "@/lib/data";

// Initialize into dbStore for in-memory persistence
if (!(dbStore as any).itJobs) {
  (dbStore as any).itJobs = [...initialITJobs];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const experience = searchParams.get("experience");
    const workMode = searchParams.get("work_mode");
    const location = searchParams.get("location");
    const limit = parseInt(searchParams.get("limit") || "50");

    let jobs: ITJobItem[] = (dbStore as any).itJobs || initialITJobs;

    if (category && category !== "ALL") {
      jobs = jobs.filter(j => j.category === category);
    }
    if (experience && experience !== "ALL") {
      jobs = jobs.filter(j => j.experience_level === experience);
    }
    if (workMode && workMode !== "ALL") {
      jobs = jobs.filter(j => j.work_mode === workMode);
    }
    if (location && location !== "ALL") {
      jobs = jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      jobs = jobs.filter(
        j =>
          j.title.toLowerCase().includes(q) ||
          j.company_name.toLowerCase().includes(q) ||
          j.required_skills.some(s => s.toLowerCase().includes(q)) ||
          j.location.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      total: jobs.length,
      jobs: jobs.slice(0, limit)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch IT jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newJob: ITJobItem = {
      id: Date.now(),
      title: body.title,
      slug: (body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")).toLowerCase(),
      company_name: body.company_name,
      company_logo_url: body.company_logo_url || "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop",
      company_website: body.company_website || "https://careers.google.com",
      category: body.category || "SOFTWARE_DEV",
      category_display: body.category_display || "Software Developer",
      job_type: body.job_type || "FULL_TIME",
      experience_level: body.experience_level || "FRESHER",
      work_mode: body.work_mode || "HYBRID",
      location: body.location || "All India",
      salary_range: body.salary_range || "Competitive Market Standard",
      qualification: body.qualification || "B.E. / B.Tech / BCA / Any Graduate",
      required_skills: Array.isArray(body.required_skills) ? body.required_skills : (body.required_skills?.split(",") || ["JavaScript", "Python"]),
      job_description: body.job_description || "Exciting software opportunity with verified employer.",
      responsibilities: body.responsibilities || ["Design and develop software components.", "Collaborate with agile cross-functional team."],
      official_apply_url: body.official_apply_url,
      application_deadline: body.application_deadline || new Date(Date.now() + 86400000 * 30).toISOString(),
      is_featured: Boolean(body.is_featured),
      view_count: 0,
      apply_clicks_count: 0,
      status: "PUBLISHED",
      published_at: new Date().toISOString()
    };

    if (!(dbStore as any).itJobs) {
      (dbStore as any).itJobs = [...initialITJobs];
    }
    (dbStore as any).itJobs.unshift(newJob);

    return NextResponse.json({ success: true, job: newJob });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create IT job" }, { status: 500 });
  }
}
