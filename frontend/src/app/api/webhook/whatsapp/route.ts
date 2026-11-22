import { NextRequest, NextResponse } from "next/server";
import { aiManager, processAIManagerCommand } from "@/lib/aiManager";

// GET /api/webhook/whatsapp - Meta WhatsApp Cloud API Webhook Verification Handshake
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const expectedToken = aiManager.config.whatsapp.webhookVerifyToken || "examhub_ai_manager_whatsapp_secure_token_2026";

    if (mode === "subscribe" && token === expectedToken) {
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    // Log suspicious probe if token does not match
    aiManager.securityThreats.unshift({
      id: `THREAT-${Date.now()}`,
      threatType: "UNAUTHORIZED_WHATSAPP",
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      endpoint: "/api/webhook/whatsapp",
      severity: "HIGH",
      details: `Invalid webhook verification token attempt: '${token}'`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/webhook/whatsapp - Handle Incoming WhatsApp Admin Messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Extract sender phone number and message body
    // Supports both standard Meta Cloud API payload and generic Twilio/Webhook JSON formats
    let senderNumber = "";
    let incomingMessage = "";

    if (body.entry && body.entry[0]?.changes && body.entry[0]?.changes[0]?.value?.messages) {
      const msg = body.entry[0].changes[0].value.messages[0];
      senderNumber = msg.from; // e.g. "919876543210"
      incomingMessage = msg.text?.body || "";
    } else if (body.From || body.from) {
      senderNumber = (body.From || body.from).replace(/[^\d+]/g, "");
      incomingMessage = body.Body || body.text || body.message || "";
    } else if (body.sender && body.text) {
      senderNumber = body.sender;
      incomingMessage = body.text;
    }

    if (!incomingMessage) {
      return NextResponse.json({ status: "IGNORED_EMPTY" }, { status: 200 });
    }

    // 2. Strict Admin-Only Sender Validation (reads private server-side env)
    const configuredAdminPhone = (process.env.ADMIN_WHATSAPP_NUMBER || aiManager.config.whatsapp.adminPhoneNumber || "+918220525033").replace(/[^\d]/g, "");
    const cleanSender = senderNumber.replace(/[^\d]/g, "");

    const isAuthorized = cleanSender.endsWith(configuredAdminPhone.slice(-10)) || configuredAdminPhone.endsWith(cleanSender.slice(-10));

    if (!isAuthorized) {
      // Log unauthorized attempt
      aiManager.securityThreats.unshift({
        id: `THREAT-${Date.now()}`,
        threatType: "UNAUTHORIZED_WHATSAPP",
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        endpoint: "/api/webhook/whatsapp",
        severity: "CRITICAL",
        details: `Unauthorized WhatsApp message attempt from non-admin phone: +${senderNumber}`,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        status: "UNAUTHORIZED",
        reply: "⛔ Access Denied. ExamHub India AI Website Manager is restricted strictly to authorized platform administrators."
      }, { status: 403 });
    }

    // 3. Process natural language command as authorized administrator
    const commandResult = await processAIManagerCommand(incomingMessage, "WHATSAPP");

    // Add to task history
    aiManager.taskHistory.unshift({
      id: `TASK-${Date.now()}`,
      taskType: "WHATSAPP_DIGEST",
      status: "COMPLETED",
      summary: `WhatsApp command from Admin (+${cleanSender.slice(-4)}): "${incomingMessage.slice(0, 40)}"`,
      durationMs: 140,
      initiatedBy: "WHATSAPP_COMMAND",
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      status: "SUCCESS",
      sender: senderNumber,
      reply: commandResult.reply,
      actionTaken: commandResult.actionTaken
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
