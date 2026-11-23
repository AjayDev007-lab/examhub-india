import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";
import { generateJobWhatsAppMessage, dispatchAutomaticWhatsAppChannelPost } from "@/lib/whatsappJobNotification";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const jobs = (dbStore as any).jobs || [];

    const job = jobs.find((j: any) => 
      j.slug === slug.toLowerCase() || String(j.id) === slug
    );

    if (!job) {
      return NextResponse.json({ error: "Job notification not found" }, { status: 404 });
    }

    // Increment view count
    job.view_count = (job.view_count || 0) + 1;

    const now = new Date();
    let isClosingSoon = false;
    let isExpired = false;
    if (job.application_end_date) {
      const diffMs = new Date(job.application_end_date).getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays < 0) isExpired = true;
      else if (diffDays <= 3) isClosingSoon = true;
    }

    const isSaved = ((dbStore as any).savedJobs || []).some((s: any) => s.jobId === job.id && s.userId === 1);

    return NextResponse.json({
      ...job,
      is_closing_soon: isClosingSoon,
      is_expired: isExpired,
      is_saved: isSaved
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const jobs = (dbStore as any).jobs || [];

    const jobIndex = jobs.findIndex((j: any) => 
      j.slug === slug.toLowerCase() || String(j.id) === slug
    );

    if (jobIndex === -1) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const current = jobs[jobIndex];
    const prevStatus = current.status;

    if (body.title) current.title = body.title.trim();
    if (body.status) current.status = body.status;
    if (body.vacancies_count !== undefined) current.vacancies_count = Number(body.vacancies_count);
    if (body.total_vacancies !== undefined) current.total_vacancies = Number(body.total_vacancies);
    if (body.application_end_date !== undefined) current.application_end_date = body.application_end_date;
    if (body.last_date_to_apply !== undefined) current.last_date_to_apply = body.last_date_to_apply;
    if (body.official_application_url) current.official_application_url = body.official_application_url.trim();
    if (body.official_apply_url) current.official_apply_url = body.official_apply_url.trim();
    if (body.official_notification_pdf !== undefined) current.official_notification_pdf = body.official_notification_pdf;
    if (body.official_notification_pdf_url !== undefined) current.official_notification_pdf_url = body.official_notification_pdf_url;
    
    // Manage Automated WhatsApp Notification Lifecycle & Channel Broadcast
    if (body.status === "PUBLISHED" && (prevStatus !== "PUBLISHED" || !current.whatsapp_message)) {
      if (current.whatsapp_status !== "SENT_TO_ADMIN" && current.whatsapp_status !== "POSTED_TO_CHANNEL") {
        current.whatsapp_message = generateJobWhatsAppMessage(current);
        current.whatsapp_generated_at = new Date().toISOString();
        const channelResult = await dispatchAutomaticWhatsAppChannelPost(current);
        current.whatsapp_status = channelResult.status === "POSTED_TO_CHANNEL" ? "POSTED_TO_CHANNEL" : "READY_TO_POST";
        if (channelResult.status === "POSTED_TO_CHANNEL") {
          current.whatsapp_posted_at = new Date().toISOString();
        }
      }
      current.published_at = current.published_at || new Date().toISOString();
    } else if (body.status === "DRAFT" && current.whatsapp_status !== "SENT_TO_ADMIN") {
      current.whatsapp_status = "PENDING";
    }

    if (body.whatsapp_status) {
      current.whatsapp_status = body.whatsapp_status;
    }

    current.last_verified_at = new Date().toISOString();

    return NextResponse.json({
      ...current,
      job: current
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
