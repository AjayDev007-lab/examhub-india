import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";
import { 
  sendTelegramChannelPost, 
  formatJobTelegramPost, 
  TELEGRAM_PUBLIC_CHANNEL_ID,
  TELEGRAM_PUBLIC_CHANNEL_URL 
} from "@/lib/telegramManager";

// POST /api/admin/telegram/channel-dispatch - Broadcast updates to public Telegram channel
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "DISPATCH_CHANNEL";
    const jobs = (dbStore as any).jobs || [];

    let targetJob = null;
    if (body.jobId) {
      targetJob = jobs.find((j: any) => String(j.id) === String(body.jobId) || j.slug === String(body.jobId));
    } else if (body.job) {
      targetJob = body.job;
    }

    if (action === "PREVIEW") {
      if (!targetJob && !body.messageText) {
        return NextResponse.json({ success: false, error: "Job data or custom message is required for preview." }, { status: 400 });
      }

      const text = body.messageText || formatJobTelegramPost(targetJob);
      return NextResponse.json({
        success: true,
        previewText: text,
        channel: TELEGRAM_PUBLIC_CHANNEL_ID,
        channelUrl: TELEGRAM_PUBLIC_CHANNEL_URL
      });
    }

    if (action === "DISPATCH_CHANNEL") {
      const messageText = body.messageText || (targetJob ? formatJobTelegramPost(targetJob) : null);
      if (!messageText) {
        return NextResponse.json({ success: false, error: "No message text available to publish." }, { status: 400 });
      }

      const result = await sendTelegramChannelPost(messageText);

      // Record status in memory if associated with a job
      if (result.success && targetJob) {
        targetJob.telegram_channel_status = "POSTED_TO_CHANNEL";
        targetJob.telegram_message_id = result.details?.messageId;
        targetJob.telegram_posted_at = new Date().toISOString();
        targetJob.telegram_error = null;
      } else if (!result.success && targetJob) {
        targetJob.telegram_channel_status = "FAILED";
        targetJob.telegram_error = result.message || "Failed to post to Telegram channel";
      }

      return NextResponse.json({
        success: result.success,
        status: result.status,
        message: result.message,
        messageId: result.details?.messageId,
        channel: TELEGRAM_PUBLIC_CHANNEL_ID,
        channelUrl: TELEGRAM_PUBLIC_CHANNEL_URL,
        postedAt: targetJob?.telegram_posted_at || new Date().toISOString(),
        details: result.details
      }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
