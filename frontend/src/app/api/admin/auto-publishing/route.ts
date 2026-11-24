// ============================================================================
// EXAMHUB INDIA — ADMIN AUTO-PUBLISHING API ROUTE
// Provides real-time metrics, verification evidence log, pause/resume controls
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getAutoPublishConfig,
  updateAutoPublishConfig,
  getVerificationLogs,
  processAndAutoPublishJob
} from "@/lib/aiJobVerification";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const config = getAutoPublishConfig();
    const logs = getVerificationLogs(100);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      config,
      metrics: {
        discovered: config.totalDiscoveredCount,
        verified: config.totalVerifiedCount,
        published: config.totalPublishedCount,
        rejected: config.totalRejectedCount,
        expired: config.totalExpiredCount,
        suspicious: config.totalSuspiciousCount,
        unverifiable: config.totalUnverifiableCount,
        duplicates: config.totalDuplicatesBlocked,
        deliveryFailures: config.totalDeliveryFailures,
        lastPublishedAt: config.lastPublishedAt || null,
        isPaused: config.pausePublishing,
        channel: config.targetChannel
      },
      logs
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve auto-publishing metrics" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action?.toUpperCase();

    if (action === "PAUSE") {
      const updated = updateAutoPublishConfig({ pausePublishing: true });
      return NextResponse.json({
        success: true,
        message: "Automatic Telegram job publishing has been globally PAUSED.",
        config: updated
      });
    }

    if (action === "RESUME") {
      const updated = updateAutoPublishConfig({ pausePublishing: false });
      return NextResponse.json({
        success: true,
        message: "Automatic Telegram job publishing has been RESUMED.",
        config: updated
      });
    }

    if (action === "TRIGGER_TEST") {
      // Create a genuine test job for verification
      const testJob = {
        id: `test-${Date.now()}`,
        title: body.title || "SSC Combined Graduate Level (CGL) 2026 Recruitment",
        organization_name: body.organization || "Staff Selection Commission",
        sector: "CENTRAL_GOVT",
        category: "GOVERNMENT",
        location: body.location || "All India",
        qualification: "Bachelor's Degree in any discipline from a recognized University",
        experience_required: "Fresher / As per norms",
        salary_range: "Level-4 to Level-8 (Rs. 25,500 - Rs. 1,51,100)",
        application_start_date: new Date().toISOString(),
        application_end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        official_notification_pdf: "https://ssc.gov.in/notice-cgl-2026.pdf",
        official_application_url: "https://ssc.gov.in/apply-cgl-2026",
        source_website_url: "https://ssc.gov.in"
      };

      const result = await processAndAutoPublishJob(testJob, {
        forcePublishTest: true,
        customChannel: body.channel || "@india102210"
      });

      return NextResponse.json({
        success: result.published,
        result,
        message: result.published
          ? `Verified test job broadcast successfully to ${result.channel} (Message ID: ${result.messageId}).`
          : `Test job rejected or delivery failed: ${result.reasons?.join(", ") || result.error}`
      });
    }

    if (action === "UPDATE_CONFIG") {
      const patch: any = {};
      if (typeof body.minScoreToPublish === "number") patch.minScoreToPublish = body.minScoreToPublish;
      if (typeof body.targetChannel === "string") patch.targetChannel = body.targetChannel;
      const updated = updateAutoPublishConfig(patch);
      return NextResponse.json({
        success: true,
        message: "Auto-publishing configuration updated successfully.",
        config: updated
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process auto-publishing command" },
      { status: 500 }
    );
  }
}
