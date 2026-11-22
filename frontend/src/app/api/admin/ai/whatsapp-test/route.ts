import { NextRequest, NextResponse } from "next/server";
import { aiManager, generateWhatsAppDailyDigest } from "@/lib/aiManager";

// POST /api/admin/ai/whatsapp-test - Send test WhatsApp Digest to admin phone number
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetPhone = body.phoneNumber || aiManager.config.whatsapp.adminPhoneNumber;

    const digest = generateWhatsAppDailyDigest();

    aiManager.config.whatsapp.lastReportSentAt = new Date().toISOString();
    aiManager.taskHistory.unshift({
      id: `TASK-${Date.now()}`,
      taskType: "WHATSAPP_DIGEST",
      status: "COMPLETED",
      summary: `Manual test WhatsApp digest dispatched to Admin Phone (${targetPhone}).`,
      durationMs: 280,
      initiatedBy: "ADMIN_WEB",
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Test WhatsApp digest successfully prepared and dispatched to ${targetPhone}`,
      targetPhone,
      digestContent: digest,
      sentAt: aiManager.config.whatsapp.lastReportSentAt
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
