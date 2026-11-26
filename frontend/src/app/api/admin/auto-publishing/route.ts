// ============================================================================
// EXAMHUB INDIA — ADMIN AUTO-PUBLISHING API ROUTE
// Secured server-side administrative controller for Cloud Firestore publishing queue
// Protected with strict authentication, CSRF checks, and role validation
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
  migrateJobsToFirestore,
  reconcileUncertainDelivery
} from "@/lib/jobQueue";
import {
  verifyAdminAuthorization,
  unauthorizedResponse,
  sanitizeAdminPayload
} from "@/lib/adminAuth";
import { runAutomatedJobDiscovery } from "@/lib/jobDiscovery";
import {
  HISTORICAL_EXPIRED_ARCHIVE,
  ACTIVE_VERIFIED_OPPORTUNITIES,
  QUARANTINED_OPPORTUNITIES
} from "@/lib/historicalExpiredArchive";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Mandatory Server-Side Admin Authentication Check
    const auth = verifyAdminAuthorization(req);
    if (!auth.authorized) {
      return unauthorizedResponse(auth);
    }

    const config = getAutoPublishConfig();
    const logs = getVerificationLogs(100);
    const queueTelemetry = await getQueueTelemetry();
    const queueItems = await getQueueItems(50);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      authenticatedAdmin: auth.adminUser?.email,
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
        dispatchingCount: queueTelemetry.dispatchingCount || 0,
        uncertainCount: queueTelemetry.uncertainCount || 0,
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
        dailyFirestoreUsage: queueTelemetry.dailyFirestoreUsage || null,
        error: queueTelemetry.error || null
      },
      queue: queueItems,
      uncertainDeliveries: queueItems.filter(i => i.status === "UNCERTAIN_DELIVERY" || i.status === "DISPATCHING"),
      archivedExpired: HISTORICAL_EXPIRED_ARCHIVE,
      quarantined: QUARANTINED_OPPORTUNITIES,
      activeVerified: ACTIVE_VERIFIED_OPPORTUNITIES,
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
    // 1. Mandatory Server-Side Admin Authentication Check
    const auth = verifyAdminAuthorization(req);
    if (!auth.authorized) {
      return unauthorizedResponse(auth);
    }

    // 2. Strict Input Validation & Sanitization
    const rawBody = await req.json().catch(() => null);
    const sanitized = sanitizeAdminPayload(rawBody);
    if (!sanitized.valid) {
      return NextResponse.json(
        { success: false, error: sanitized.error || "Invalid request payload." },
        { status: 400 }
      );
    }

    const action = sanitized.action;
    const body = rawBody;

    // ACTION: RETRY QUEUE (Retries confirmed failed/rate-limited jobs only)
    if (action === "RETRY_QUEUE") {
      const res = await retryPendingNow();
      return NextResponse.json({
        success: true,
        message: res.message,
        processedCount: res.processedCount
      });
    }

    // ACTION: MIGRATE VERIFIED JOBS TO FIRESTORE (Filters out expired jobs)
    if (action === "MIGRATE_TO_FIRESTORE") {
      const jobsToMigrate = Array.isArray(body.jobs) && body.jobs.length > 0
        ? body.jobs
        : ACTIVE_VERIFIED_OPPORTUNITIES;

      const res = await migrateJobsToFirestore(jobsToMigrate);
      return NextResponse.json({
        success: res.errors.length === 0,
        message: `Firestore Migration: ${res.migratedCount} active verified opportunities imported, ${res.skippedDuplicates} duplicates preserved, ${res.skippedExpired} expired records filtered.`,
        migratedCount: res.migratedCount,
        skippedDuplicates: res.skippedDuplicates,
        skippedExpired: res.skippedExpired,
        errors: res.errors
      });
    }

    // ACTION: RECONCILE UNCERTAIN DELIVERY (Crash Recovery Guard)
    if (action === "RECONCILE_UNCERTAIN") {
      const itemId = String(body.itemId || "").trim();
      const resolution = String(body.resolution || "").trim().toUpperCase();

      if (!itemId) {
        return NextResponse.json({ success: false, error: "Missing required itemId for reconciliation." }, { status: 400 });
      }

      if (resolution !== "CONFIRM_DELIVERED" && resolution !== "CONFIRM_NOT_DELIVERED" && resolution !== "MARK_FAILED") {
        return NextResponse.json({
          success: false,
          error: "Invalid resolution. Must be 'CONFIRM_DELIVERED', 'CONFIRM_NOT_DELIVERED', or 'MARK_FAILED'."
        }, { status: 400 });
      }

      const res = await reconcileUncertainDelivery(
        itemId,
        resolution as any,
        auth.adminUser?.email || "SUPER_ADMIN",
        {
          telegramMessageId: typeof body.telegramMessageId === "number" ? body.telegramMessageId : undefined,
          notes: body.notes
        }
      );

      return NextResponse.json({
        success: res.success,
        message: res.message,
        status: res.status
      });
    }

    // ACTION: RUN DISCOVERY SCAN
    if (action === "DISCOVERY_SCAN") {
      const scanResult = await runAutomatedJobDiscovery({ maxJobsToPublish: 1 });
      return NextResponse.json({
        success: true,
        message: `Automated scan completed: ${scanResult.totalDiscovered} discovered, ${scanResult.verifiedCount} verified, ${scanResult.blockedCount} blocked/expired.`,
        scanResult
      });
    }

    // ACTION: EXPORT QUEUE RECORDS
    if (action === "EXPORT_QUEUE") {
      const allItems = await getQueueItems(100);
      return NextResponse.json({
        success: true,
        exportTimestamp: new Date().toISOString(),
        totalItems: allItems.length,
        items: allItems
      });
    }

    // ACTION: GLOBAL PAUSE
    if (action === "PAUSE") {
      const updated = updateAutoPublishConfig({ pausePublishing: true });
      return NextResponse.json({
        success: true,
        message: "Automatic Telegram job publishing has been globally PAUSED.",
        config: updated
      });
    }

    // ACTION: GLOBAL RESUME
    if (action === "RESUME") {
      const updated = updateAutoPublishConfig({ pausePublishing: false });
      return NextResponse.json({
        success: true,
        message: "Automatic Telegram job publishing has been RESUMED.",
        config: updated
      });
    }

    // ACTION: TRIGGER TEST PUBLISH
    if (action === "TRIGGER_TEST") {
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

    // ACTION: UPDATE CONFIG
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

    return NextResponse.json({ success: false, error: `Invalid or unrecognized action: '${action}'.` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process auto-publishing command" },
      { status: 500 }
    );
  }
}
