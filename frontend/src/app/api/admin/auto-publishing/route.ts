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
import {
  getQueueTelemetry,
  getQueueItems,
  retryPendingNow,
  migrateJobsToFirestore
} from "@/lib/jobQueue";

export const dynamic = "force-dynamic";

export const REAL_PENDING_OPPORTUNITIES = [
  {
    id: "upsc-cds-1-2026",
    title: "UPSC Combined Defence Services Examination (CDS I) 2026",
    organization_name: "Union Public Service Commission (UPSC)",
    sector: "DEFENCE",
    category: "GOVERNMENT",
    location: "All India",
    qualification: "Degree of a recognized University or equivalent / Engineering Degree for IAF/Navy",
    experience_required: "Fresher / Unmarried Male & Female",
    salary_range: "Level 10 (Rs. 56,100 - Rs. 1,77,500)",
    application_start_date: "2025-12-10T00:00:00+05:30",
    application_end_date: "2026-01-09T18:00:00+05:30",
    official_notification_pdf: "https://upsc.gov.in/sites/default/files/Notice-CDSI-2026.pdf",
    official_application_url: "https://upsconline.nic.in",
    source_website_url: "https://upsc.gov.in"
  },
  {
    id: "ssc-chsl-2026",
    title: "SSC Combined Higher Secondary Level (CHSL) Examination 2026",
    organization_name: "Staff Selection Commission (SSC)",
    sector: "CENTRAL_GOVT",
    category: "GOVERNMENT",
    location: "All India",
    qualification: "12th Standard or equivalent examination from a recognized Board or University",
    experience_required: "Fresher",
    salary_range: "Pay Level-2 to Pay Level-5 (Rs. 19,900 - Rs. 92,300)",
    application_start_date: "2026-04-02T00:00:00+05:30",
    application_end_date: "2026-05-18T23:00:00+05:30",
    official_notification_pdf: "https://ssc.gov.in/notice-chsl-2026.pdf",
    official_application_url: "https://ssc.gov.in",
    source_website_url: "https://ssc.gov.in"
  },
  {
    id: "zoho-sde-chennai-2026",
    title: "Zoho Corporation Junior Software Development Engineer 2026",
    organization_name: "Zoho Corporation",
    sector: "IT_SOFTWARE",
    category: "PRIVATE",
    location: "Chennai, Tamil Nadu",
    qualification: "B.E / B.Tech / MCA / M.Sc in Computer Science or related IT stream",
    experience_required: "0 - 2 Years",
    salary_range: "Rs. 6,00,000 - Rs. 10,00,000 Per Annum",
    application_start_date: "2026-01-01T00:00:00+05:30",
    application_end_date: "2026-12-31T23:59:59+05:30",
    official_notification_pdf: null,
    official_application_url: "https://careers.zohocorp.com/apply-sde-2026",
    source_website_url: "https://www.zoho.com/careers"
  },
  {
    id: "infosys-dse-2026",
    title: "Infosys Digital Specialist Engineer (DSE) 2026 Recruitment Drive",
    organization_name: "Infosys Limited",
    sector: "IT_SOFTWARE",
    category: "PRIVATE",
    location: "Remote / Hybrid (All India)",
    qualification: "B.E / B.Tech / M.E / M.Tech in CS/IT/ECE/EE with min 65% aggregate",
    experience_required: "Fresher / 2025-2026 Batch",
    salary_range: "Rs. 6,25,000 - Rs. 9,50,000 Per Annum",
    application_start_date: "2026-01-15T00:00:00+05:30",
    application_end_date: "2026-12-15T23:59:59+05:30",
    official_notification_pdf: null,
    official_application_url: "https://career.infosys.com/jobdesc?jobReferenceCode=INF-DSE-2026",
    source_website_url: "https://www.infosys.com/careers"
  }
];

export async function GET(req: NextRequest) {
  try {
    const config = getAutoPublishConfig();
    const logs = getVerificationLogs(100);
    const queueTelemetry = await getQueueTelemetry();
    const queueItems = await getQueueItems(50);

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
        channel: config.targetChannel,
        // Firestore Queue Telemetry
        isConfigured: queueTelemetry.isConfigured,
        provider: queueTelemetry.provider || "FIRESTORE_DISCONNECTED",
        projectId: queueTelemetry.projectId || "examhub-india-6ba59",
        collection: queueTelemetry.collection || "telegram_publishing_queue",
        queueCount: queueTelemetry.queueCount || 0,
        pendingCount: queueTelemetry.pendingCount || 0,
        rateLimited: queueTelemetry.rateLimitedCount || 0,
        retrying: queueTelemetry.retryingCount || 0,
        sentCount: queueTelemetry.sentCount || 0,
        failed: queueTelemetry.failedCount || 0,
        nextRetryAt: queueTelemetry.nextRetryAt || null,
        lastSuccessfulDeliveryAt: queueTelemetry.lastSuccessfulDeliveryAt || null,
        lastSuccessfulMessageId: queueTelemetry.lastSuccessfulMessageId || null,
        permanentErrors: queueTelemetry.permanentErrors || 0,
        expiredInQueue: queueTelemetry.expiredInQueueCount || 0,
        isChannelThrottled: queueTelemetry.isChannelThrottled || false,
        channelThrottledUntil: queueTelemetry.channelThrottledUntil || null,
        error: queueTelemetry.error || null
      },
      queue: queueItems,
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

    if (action === "RETRY_QUEUE") {
      const res = await retryPendingNow();
      return NextResponse.json({
        success: true,
        message: res.message,
        processedCount: res.processedCount
      });
    }

    if (action === "MIGRATE_TO_FIRESTORE") {
      const jobsToMigrate = Array.isArray(body.jobs) && body.jobs.length > 0
        ? body.jobs
        : REAL_PENDING_OPPORTUNITIES;

      const res = await migrateJobsToFirestore(jobsToMigrate);
      return NextResponse.json({
        success: res.errors.length === 0,
        message: `Firestore Migration: ${res.migratedCount} opportunities migrated, ${res.skippedDuplicates} duplicates preserved.`,
        migratedCount: res.migratedCount,
        skippedDuplicates: res.skippedDuplicates,
        errors: res.errors
      });
    }

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
