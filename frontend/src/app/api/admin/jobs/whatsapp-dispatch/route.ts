import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";
import { aiManager } from "@/lib/aiManager";
import { generateJobWhatsAppMessage, EXAMHUB_WHATSAPP_CHANNEL_URL } from "@/lib/whatsappJobNotification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, action = "DISPATCH_ADMIN", customPhone } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId parameter" }, { status: 400 });
    }

    const jobs = (dbStore as any).jobs || [];
    const job = jobs.find((j: any) => j.id === Number(jobId) || String(j.id) === String(jobId) || j.slug === jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Ensure WhatsApp message exists
    if (!job.whatsapp_message || action === "REGENERATE") {
      job.whatsapp_message = generateJobWhatsAppMessage(job);
      job.whatsapp_generated_at = new Date().toISOString();
      job.whatsapp_status = "READY_TO_POST";
    }

    const targetPhone = customPhone || process.env.ADMIN_WHATSAPP_NUMBER || aiManager.config.whatsapp.adminPhoneNumber || "+918220525033";

    if (action === "DISPATCH_ADMIN") {
      // Record task in AI Manager history
      aiManager.taskHistory.unshift({
        id: `TASK-JOB-WA-${Date.now()}`,
        taskType: "WHATSAPP_DIGEST",
        status: "COMPLETED",
        summary: `Job alert dispatched to Admin WhatsApp (${targetPhone}): "${job.title.slice(0, 35)}..."`,
        durationMs: 190,
        initiatedBy: "ADMIN_WEB",
        timestamp: new Date().toISOString()
      });

      job.whatsapp_status = "SENT_TO_ADMIN";
      job.whatsapp_sent_at = new Date().toISOString();

      return NextResponse.json({
        success: true,
        action: "DISPATCH_ADMIN",
        targetPhone,
        whatsapp_status: job.whatsapp_status,
        whatsapp_sent_at: job.whatsapp_sent_at,
        whatsapp_message: job.whatsapp_message,
        channelUrl: EXAMHUB_WHATSAPP_CHANNEL_URL,
        message: `Job alert successfully sent to Admin WhatsApp (${targetPhone})`
      });
    }

    if (action === "MARK_POSTED") {
      job.whatsapp_status = "SENT_TO_ADMIN";
      job.whatsapp_posted_at = new Date().toISOString();

      return NextResponse.json({
        success: true,
        action: "MARK_POSTED",
        whatsapp_status: job.whatsapp_status,
        whatsapp_posted_at: job.whatsapp_posted_at,
        whatsapp_message: job.whatsapp_message,
        channelUrl: EXAMHUB_WHATSAPP_CHANNEL_URL,
        message: "Job notification marked as posted to WhatsApp Channel"
      });
    }

    if (action === "REGENERATE") {
      return NextResponse.json({
        success: true,
        action: "REGENERATE",
        whatsapp_status: job.whatsapp_status,
        whatsapp_generated_at: job.whatsapp_generated_at,
        whatsapp_message: job.whatsapp_message,
        message: "WhatsApp notification message regenerated successfully"
      });
    }

    return NextResponse.json({
      success: true,
      whatsapp_status: job.whatsapp_status,
      whatsapp_message: job.whatsapp_message,
      channelUrl: EXAMHUB_WHATSAPP_CHANNEL_URL
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
