import { NextRequest, NextResponse } from "next/server";
import { aiManager } from "@/lib/aiManager";
import { 
  fetchTelegramUpdates, 
  resolveAdminChatIdFromUpdates, 
  setDynamicAdminChatId,
  deleteTelegramWebhook,
  getTelegramConfig,
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_ADMIN_USERNAME
} from "@/lib/telegramManager";

// GET /api/admin/telegram/resolve-chat-id
export async function GET(req: NextRequest) {
  return handleResolve(req, {});
}

// POST /api/admin/telegram/resolve-chat-id
// Supports:
// 1. Auto-detection from recent getUpdates
// 2. Direct activation: { action: "SET_CHAT_ID", chatId: "1092847192" }
// 3. Webhook reset: { action: "CLEAR_WEBHOOK" }
export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (_) {
    // Body is optional for simple resolve trigger
  }
  return handleResolve(req, body);
}

async function handleResolve(req: NextRequest, body: any) {
  try {
    const config = getTelegramConfig();

    // Action 1: Direct Save & Activate numerical Chat ID
    if (body.action === "SET_CHAT_ID") {
      const chatId = String(body.chatId || "").trim();
      if (!chatId || !/^-?\d+$/.test(chatId)) {
        return NextResponse.json({
          success: false,
          error: "Invalid Chat ID format. Telegram Chat IDs must be numeric (e.g. 682918392)."
        }, { status: 400 });
      }

      setDynamicAdminChatId(chatId);
      if (aiManager && aiManager.config && aiManager.config.telegram) {
        aiManager.config.telegram.adminChatId = chatId;
        aiManager.config.telegram.isChatIdConfigured = true;
        aiManager.config.telegram.isEnabled = Boolean(config.isTokenConfigured && chatId);
      }

      return NextResponse.json({
        success: true,
        chatId,
        botUsername: TELEGRAM_BOT_USERNAME,
        adminUsername: TELEGRAM_ADMIN_USERNAME,
        message: `Admin Telegram Chat ID ${chatId} activated successfully for this server session.`
      });
    }

    // Action 2: Clear active webhook if needed
    if (body.action === "CLEAR_WEBHOOK") {
      const clearRes = await deleteTelegramWebhook();
      return NextResponse.json({
        success: clearRes.success,
        description: clearRes.description
      });
    }

    // Action 3: Auto-detection via getUpdates
    if (!config.isTokenConfigured) {
      return NextResponse.json({
        success: false,
        found: false,
        status: "TOKEN_MISSING",
        error: "TELEGRAM_BOT_TOKEN is not configured in server environment variables.",
        botUsername: TELEGRAM_BOT_USERNAME,
        adminUsername: TELEGRAM_ADMIN_USERNAME,
        instructions: "Please paste your Telegram Bot Token in Vercel or frontend/.env.local as TELEGRAM_BOT_TOKEN."
      }, { status: 400 });
    }

    const updatesResult = await fetchTelegramUpdates();

    if (!updatesResult.success) {
      let friendlyError = updatesResult.error || "Unable to query Telegram Bot API.";
      if (friendlyError.toLowerCase().includes("not found")) {
        friendlyError = "Telegram API returned 'Not Found'. This indicates TELEGRAM_BOT_TOKEN in Vercel environment variables is invalid or formatted incorrectly. Please check Vercel Project Settings > Environment Variables and ensure TELEGRAM_BOT_TOKEN matches the exact token from @BotFather (e.g. 123456789:ABC...) without surrounding quotes.";
      }
      return NextResponse.json({
        success: false,
        found: false,
        status: "API_ERROR",
        error: friendlyError,
        webhookCleared: updatesResult.webhookCleared,
        botUsername: TELEGRAM_BOT_USERNAME,
        adminUsername: TELEGRAM_ADMIN_USERNAME
      }, { status: 200 });
    }

    const match = resolveAdminChatIdFromUpdates(updatesResult.updates, TELEGRAM_ADMIN_USERNAME);

    if (match.found && match.chatId) {
      // Store in runtime state
      setDynamicAdminChatId(match.chatId);
      if (aiManager && aiManager.config && aiManager.config.telegram) {
        aiManager.config.telegram.adminChatId = match.chatId;
        aiManager.config.telegram.isChatIdConfigured = true;
        aiManager.config.telegram.isEnabled = true;
      }

      return NextResponse.json({
        success: true,
        found: true,
        status: "RESOLVED",
        chatId: match.chatId,
        matchedUsername: match.matchedUsername,
        senderName: match.senderName,
        lastMessageText: match.lastMessageText,
        matchConfidence: match.matchConfidence,
        totalUpdatesScanned: updatesResult.updates.length,
        webhookCleared: updatesResult.webhookCleared,
        candidates: match.candidates,
        botUsername: TELEGRAM_BOT_USERNAME,
        adminUsername: TELEGRAM_ADMIN_USERNAME,
        message: `Successfully resolved numerical Telegram Chat ID for ${match.senderName || match.matchedUsername}: ${match.chatId}.`
      });
    }

    // If no exact match, return candidates and helpful guidance
    return NextResponse.json({
      success: true,
      found: false,
      status: "AWAITING_USER_START",
      botUsername: TELEGRAM_BOT_USERNAME,
      adminUsername: TELEGRAM_ADMIN_USERNAME,
      totalUpdatesScanned: updatesResult.updates.length,
      webhookCleared: updatesResult.webhookCleared,
      availableSenders: match.availableSenders,
      candidates: match.candidates,
      message: updatesResult.updates.length === 0
        ? `No messages received by ${TELEGRAM_BOT_USERNAME} yet. Please open Telegram, tap 'Start' on @ExamHub_AI_Guardian_Bot, send 'Hello', then click 'Auto-Detect Chat ID' again.`
        : `Scanned ${updatesResult.updates.length} updates but could not match username ${TELEGRAM_ADMIN_USERNAME}. See detected senders below or paste your Chat ID directly.`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
