import { NextRequest, NextResponse } from "next/server";
import { aiManager } from "@/lib/aiManager";
import { 
  sendTelegramAdminAlert, 
  generateTelegramDailyDigest, 
  getTelegramConfig,
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_ADMIN_USERNAME
} from "@/lib/telegramManager";

// POST /api/admin/telegram/test-dispatch
// Sends a private AI Guardian test monitoring digest strictly to the Admin Telegram account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const config = getTelegramConfig();

    const targetChatId = body.chatId || config.adminChatId;

    if (!config.isTokenConfigured) {
      return NextResponse.json({
        success: false,
        status: "TOKEN_MISSING",
        error: "TELEGRAM_BOT_TOKEN is not configured in server environment variables. Message safely held.",
        botUsername: TELEGRAM_BOT_USERNAME,
        adminUsername: TELEGRAM_ADMIN_USERNAME
      }, { status: 400 });
    }

    if (!targetChatId || !/^-?\d+$/.test(targetChatId)) {
      return NextResponse.json({
        success: false,
        status: "CHAT_ID_MISSING",
        error: "Numerical Telegram Chat ID is not configured. Please resolve your Chat ID first by sending a message to @ExamHub_AI_Guardian_Bot.",
        botUsername: TELEGRAM_BOT_USERNAME,
        adminUsername: TELEGRAM_ADMIN_USERNAME
      }, { status: 400 });
    }

    const digestMessage = generateTelegramDailyDigest(aiManager);

    const dispatchResult = await sendTelegramAdminAlert(digestMessage, {
      customChatId: targetChatId
    });

    if (dispatchResult.success) {
      aiManager.taskHistory.unshift({
        id: `TASK-TG-${Date.now()}`,
        taskType: "WHATSAPP_DIGEST", // telemetry log category
        status: "COMPLETED",
        summary: `AI Guardian digest delivered to Admin Telegram (${TELEGRAM_ADMIN_USERNAME}) [Chat ID: ${targetChatId}].`,
        durationMs: 310,
        initiatedBy: "ADMIN_WEB",
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        status: "DELIVERED",
        message: `AI Guardian monitoring digest successfully delivered to ${TELEGRAM_ADMIN_USERNAME} on Telegram!`,
        chatId: targetChatId,
        botUsername: TELEGRAM_BOT_USERNAME,
        adminUsername: TELEGRAM_ADMIN_USERNAME,
        digestContent: digestMessage
      });
    }

    return NextResponse.json({
      success: false,
      status: dispatchResult.status,
      error: dispatchResult.message,
      botUsername: TELEGRAM_BOT_USERNAME,
      adminUsername: TELEGRAM_ADMIN_USERNAME
    }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
