// ============================================================================
// EXAMHUB INDIA — ADMIN APPROVALS & WEBHOOK MANAGEMENT API
// Endpoints for Admin Console to review pending approvals, resolve requests,
// dispatch test prompts, and manage Telegram webhook configuration.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getPendingApprovals,
  getAllApprovals,
  createApprovalRequest,
  resolveApproval
} from "@/lib/approvalManager";
import {
  getTelegramWebhookInfo,
  setTelegramWebhookUrl,
  deleteTelegramWebhook,
  getTelegramConfig,
  TELEGRAM_ADMIN_USERNAME,
  TELEGRAM_DEFAULT_ADMIN_CHAT_ID
} from "@/lib/telegramManager";

export const dynamic = "force-dynamic";

// GET /api/admin/approvals - List pending & historic approvals, plus webhook status
export async function GET() {
  try {
    const pending = getPendingApprovals();
    const all = getAllApprovals();
    const config = getTelegramConfig();
    const webhookInfo = await getTelegramWebhookInfo();

    return NextResponse.json({
      success: true,
      pending,
      all,
      config,
      webhookInfo
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load approvals" },
      { status: 500 }
    );
  }
}

// POST /api/admin/approvals - Action handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "RESOLVE";

    // 1. Resolve an existing approval (Approve / Reject)
    if (action === "RESOLVE") {
      const { id, decision, resolvedBy } = body;
      if (!id || !decision) {
        return NextResponse.json(
          { success: false, error: "Both 'id' and 'decision' (APPROVE or REJECT) are required." },
          { status: 400 }
        );
      }

      const res = await resolveApproval(
        id,
        decision,
        resolvedBy || `${TELEGRAM_ADMIN_USERNAME} (Web Admin Console)`
      );

      return NextResponse.json(res);
    }

    // 2. Create a new approval request
    if (action === "CREATE") {
      const {
        actionType,
        title,
        description,
        explanation,
        whyNeeded,
        expectedResult,
        riskLevel,
        targetUrl,
        previewContent,
        payload
      } = body;

      if (!title || !description) {
        return NextResponse.json(
          { success: false, error: "'title' and 'description' are required." },
          { status: 400 }
        );
      }

      const res = await createApprovalRequest({
        actionType: actionType || "CUSTOM_ACTION",
        title,
        description,
        explanation: explanation || description,
        whyNeeded: whyNeeded || "Administrative review needed.",
        expectedResult: expectedResult || "Action executed upon verification.",
        riskLevel: riskLevel || "LOW",
        targetUrl,
        previewContent,
        payload: payload || {}
      });

      return NextResponse.json(res);
    }

    // 3. Dispatch Live Test Approval Prompt to Admin Telegram (@AJ4Y2)
    if (action === "TEST_PROMPT") {
      const testReq = await createApprovalRequest({
        actionType: "PUBLISH_JOB_TO_CHANNEL",
        title: "Publish RRB Technician Grade-I Notification to @india102210",
        description: "AI Guardian verified official Railway Recruitment Board circular for 9,144 technician vacancies.",
        explanation: "Official CEN 02/2026 notification published on RRB portals. Content has passed anti-fraud heuristics.",
        whyNeeded: "Ensure candidate community on @india102210 receives verified vacancy alerts without delay.",
        expectedResult: "Format and broadcast post with official application gateway link to public channel @india102210.",
        riskLevel: "LOW",
        targetUrl: "https://examhub-india.vercel.app/jobs/rrb-technician-2026",
        previewContent: "RRB Technician Grade-I & III | 9,144 Vacancies | ITI/Diploma/Degree | Apply by 18-Apr-2026",
        payload: {
          jobId: 1,
          channel: "@india102210"
        }
      });

      return NextResponse.json({
        success: true,
        message: testReq.telegramDelivered
          ? "Live interactive approval prompt successfully dispatched to Admin Telegram chat!"
          : "Approval request registered, but Telegram delivery failed. Check bot token configuration.",
        approval: testReq.approval,
        telegramDelivered: testReq.telegramDelivered,
        error: testReq.error
      });
    }

    // 4. Setup Telegram Webhook URL
    if (action === "SETUP_WEBHOOK") {
      const origin = body.webhookUrl || "https://examhub-india.vercel.app/api/telegram/webhook";
      const res = await setTelegramWebhookUrl(origin);
      return NextResponse.json(res);
    }

    // 5. Delete Telegram Webhook
    if (action === "DELETE_WEBHOOK") {
      const res = await deleteTelegramWebhook();
      return NextResponse.json(res);
    }

    return NextResponse.json(
      { success: false, error: `Unrecognized action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
