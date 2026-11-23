import { NextRequest, NextResponse } from "next/server";
import { 
  fetchTelegramUpdates, 
  resolveAdminChatIdFromUpdates, 
  getTelegramConfig,
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_ADMIN_USERNAME
} from "@/lib/telegramManager";

// GET or POST /api/admin/telegram/resolve-chat-id
// Safely queries Telegram getUpdates to discover the numerical chat ID of @AJ4Y2
export async function GET() {
  return handleResolve();
}

export async function POST(req: NextRequest) {
  return handleResolve();
}

async function handleResolve() {
  try {
    const config = getTelegramConfig();

    if (!config.isTokenConfigured) {
      return NextResponse.json({
        success: false,
        found: false,
        status: "TOKEN_MISSING",
        error: "TELEGRAM_BOT_TOKEN is not configured in server environment variables.",
        botUsername: TELEGRAM_BOT_USERNAME,
        adminUsername: TELEGRAM_ADMIN_USERNAME,
        instructions: "Please paste your Telegram Bot Token in frontend/.env.local as TELEGRAM_BOT_TOKEN."
      }, { status: 400 });
    }

    const updatesResult = await fetchTelegramUpdates();

    if (!updatesResult.success) {
      return NextResponse.json({
        success: false,
        found: false,
        status: "API_ERROR",
        error: updatesResult.error,
        botUsername: TELEGRAM_BOT_USERNAME,
        adminUsername: TELEGRAM_ADMIN_USERNAME
      }, { status: 502 });
    }

    const match = resolveAdminChatIdFromUpdates(updatesResult.updates, TELEGRAM_ADMIN_USERNAME);

    if (match.found && match.chatId) {
      return NextResponse.json({
        success: true,
        found: true,
        status: "RESOLVED",
        chatId: match.chatId,
        matchedUsername: match.matchedUsername,
        senderName: match.senderName,
        lastMessageText: match.lastMessageText,
        botUsername: TELEGRAM_BOT_USERNAME,
        adminUsername: TELEGRAM_ADMIN_USERNAME,
        message: `Successfully resolved numerical Telegram Chat ID for ${match.matchedUsername}: ${match.chatId}.`
      });
    }

    return NextResponse.json({
      success: true,
      found: false,
      status: "AWAITING_USER_START",
      botUsername: TELEGRAM_BOT_USERNAME,
      adminUsername: TELEGRAM_ADMIN_USERNAME,
      totalUpdatesScanned: updatesResult.updates.length,
      availableSenders: match.availableSenders,
      message: `No messages found from ${TELEGRAM_ADMIN_USERNAME} yet. Please open ${TELEGRAM_BOT_USERNAME} on Telegram, press 'Start', and send 'Hello', then click 'Resolve Chat ID' again.`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
