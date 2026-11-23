import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";
import { sendTelegramChannelPost, formatJobTelegramPost } from "@/lib/telegramManager";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const sector = searchParams.get("sector");
    const qualification = searchParams.get("qualification");
    const experience = searchParams.get("experience");
    const location = searchParams.get("location");
    const workMode = searchParams.get("work_mode");
    const status = searchParams.get("status") || "PUBLISHED";
    const closingSoon = searchParams.get("closing_soon");
    const sortBy = searchParams.get("sort_by") || "latest";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let jobs = (dbStore as any).jobs || [];

    // Status filter
    if (status && status !== "ALL") {
      jobs = jobs.filter((j: any) => j.status === status);
    }

    // Category filter
    if (category && category !== "ALL") {
      jobs = jobs.filter((j: any) => j.category.toUpperCase() === category.toUpperCase());
    }

    // Sector filter
    if (sector && sector !== "ALL") {
      jobs = jobs.filter((j: any) => j.sector.toUpperCase() === sector.toUpperCase());
    }

    // Qualification filter
    if (qualification && qualification !== "ALL") {
      jobs = jobs.filter((j: any) => 
        j.qualification.toLowerCase().includes(qualification.toLowerCase())
      );
    }

    // Experience filter
    if (experience && experience !== "ALL") {
      jobs = jobs.filter((j: any) => j.experience_required.toUpperCase() === experience.toUpperCase());
    }

    // Location filter
    if (location && location !== "ALL") {
      jobs = jobs.filter((j: any) => 
        j.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Work Mode filter
    if (workMode && workMode !== "ALL") {
      jobs = jobs.filter((j: any) => j.work_mode.toUpperCase() === workMode.toUpperCase());
    }

    // Closing soon filter (within 3 days)
    const now = new Date();
    if (closingSoon === "true" || closingSoon === "3") {
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      jobs = jobs.filter((j: any) => {
        if (!j.application_end_date) return false;
        const end = new Date(j.application_end_date);
        return end >= now && end <= threeDaysLater;
      });
    }

    // Search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      jobs = jobs.filter((j: any) => 
        j.title.toLowerCase().includes(q) ||
        j.organization_name.toLowerCase().includes(q) ||
        j.qualification.toLowerCase().includes(q) ||
        (j.required_skills && j.required_skills.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === "deadline") {
      jobs.sort((a: any, b: any) => {
        if (!a.application_end_date) return 1;
        if (!b.application_end_date) return -1;
        return new Date(a.application_end_date).getTime() - new Date(b.application_end_date).getTime();
      });
    } else if (sortBy === "popular") {
      jobs.sort((a: any, b: any) => (b.view_count || 0) - (a.view_count || 0));
    } else if (sortBy === "vacancies") {
      jobs.sort((a: any, b: any) => (b.vacancies_count || 0) - (a.vacancies_count || 0));
    } else {
      // Default: featured first, then published_at
      jobs.sort((a: any, b: any) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
      });
    }

    const total = jobs.length;
    const paginated = jobs.slice(offset, offset + limit);

    // Calculate deadline states
    const enriched = paginated.map((j: any) => {
      let isClosingSoon = false;
      let isExpired = false;
      if (j.application_end_date) {
        const diffMs = new Date(j.application_end_date).getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays < 0) isExpired = true;
        else if (diffDays <= 3) isClosingSoon = true;
      }

      const isSaved = ((dbStore as any).savedJobs || []).some((s: any) => s.jobId === j.id && s.userId === 1);

      return {
        ...j,
        is_closing_soon: isClosingSoon,
        is_expired: isExpired,
        is_saved: isSaved
      };
    });

    return NextResponse.json({
      total,
      jobs: enriched
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const title = body.title?.trim();
    const slug = (body.slug?.trim() || title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))?.toLowerCase();
    const organizationName = body.organization_name?.trim() || body.organization?.trim();
    const applyUrl = body.official_application_url?.trim() || body.official_apply_url?.trim();

    if (!title || !slug || !organizationName || !applyUrl) {
      return NextResponse.json({ error: "Missing required job fields (title, organization, apply URL)" }, { status: 400 });
    }

    const jobs = (dbStore as any).jobs;
    const newId = jobs.length > 0 ? Math.max(...jobs.map((j: any) => j.id)) + 1 : 1;

    const status = body.status || "PUBLISHED";
    const vacancies = Number(body.vacancies_count ?? body.total_vacancies) || 0;
    const salary = body.salary_range || body.pay_scale || null;
    const endDate = body.application_end_date || body.last_date_to_apply || null;
    const pdfUrl = body.official_notification_pdf || body.official_notification_pdf_url || null;

    const newJob: any = {
      id: newId,
      title,
      slug,
      organization_name: organizationName,
      organization_logo_url: body.organization_logo_url || null,
      sector: body.sector || "CENTRAL_GOVT",
      category: body.category || "GOVERNMENT",
      job_description: body.job_description || "",
      vacancies_count: vacancies,
      total_vacancies: vacancies,
      qualification: body.qualification || "Any Graduate",
      qualification_description: body.qualification_description || null,
      required_skills: body.required_skills || null,
      age_limit: body.age_limit || "18 - 30 Years",
      experience_required: body.experience_required || "FRESHER",
      salary_range: salary,
      pay_scale: salary,
      location: body.location || "All India",
      work_mode: body.work_mode || "ON_SITE",
      application_start_date: body.application_start_date || new Date().toISOString(),
      application_end_date: endDate,
      last_date_to_apply: endDate,
      application_fee: body.application_fee || null,
      selection_process: body.selection_process || null,
      syllabus_details: body.syllabus_details || null,
      official_notification_pdf: pdfUrl,
      official_notification_pdf_url: pdfUrl,
      official_application_url: applyUrl,
      official_apply_url: applyUrl,
      source_website_url: body.source_website_url?.trim() || applyUrl,
      verification_source: body.verification_source || "Official Gazette / Board Circular",
      status,
      view_count: 0,
      apply_clicks_count: 0,
      is_featured: Boolean(body.is_featured),
      published_at: status === "PUBLISHED" ? new Date().toISOString() : null,
      last_verified_at: new Date().toISOString(),
    };

    // Automated Telegram Channel Publishing (@india102210)
    const isExpired = endDate ? new Date(endDate).getTime() < Date.now() : false;

    if (status === "PUBLISHED" && !isExpired && body.broadcast_to_telegram !== false) {
      try {
        newJob.telegram_message = formatJobTelegramPost(newJob);
        newJob.telegram_generated_at = new Date().toISOString();
        const channelResult = await sendTelegramChannelPost(newJob.telegram_message);
        if (channelResult.success) {
          newJob.telegram_channel_status = "POSTED_TO_CHANNEL";
          newJob.telegram_message_id = channelResult.details?.messageId;
          newJob.telegram_posted_at = new Date().toISOString();
          newJob.telegram_error = null;
        } else {
          newJob.telegram_channel_status = "FAILED";
          newJob.telegram_error = channelResult.message || "Failed to post to Telegram channel";
        }
      } catch (err: any) {
        newJob.telegram_channel_status = "FAILED";
        newJob.telegram_error = err.message || "Network error dispatching Telegram broadcast";
      }
    } else if (isExpired) {
      newJob.telegram_channel_status = "EXPIRED";
      newJob.telegram_error = "Job application deadline has already passed; not broadcast to channel.";
    } else {
      newJob.telegram_channel_status = "DRAFT_PENDING";
    }

    jobs.unshift(newJob);

    // Audit log
    dbStore.auditLogs.unshift({
      id: Date.now(),
      actor_type: "ADMIN",
      actor_id: 1,
      action: status === "PUBLISHED" ? "JOB_NOTIFICATION_PUBLISHED" : "JOB_NOTIFICATION_DRAFTED",
      target_type: "JOB",
      target_id: newId,
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
