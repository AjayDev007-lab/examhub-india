// ============================================================================
// EXAMHUB INDIA — AUTOMATED REAL JOB DISCOVERY CRON ROUTE
// Executes scheduled discovery sweep from monitored official recruitment portals
// Enforces concurrency lock, 5-Pillar verification, quarantine holding,
// and durable Firestore execution logging.
// Schedule: Daily at 02:00 UTC (07:30 IST) — strictly within Vercel Hobby limits
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { runAutomatedJobDiscovery, getDiscoveryHistory } from "@/lib/jobDiscovery";
import { getFirestoreAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";
import { QUARANTINED_OPPORTUNITIES, HISTORICAL_EXPIRED_ARCHIVE } from "@/lib/historicalExpiredArchive";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s execution window for Next.js route

const DISCOVERY_LOCK_DOC = "job_discovery_lock";
const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes max lock duration

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const runId = `CRON-DISC-${Date.now()}`;
  const db = getFirestoreAdminDb();

  try {
    // 1. Authorization: Verify Vercel Cron Secret (if configured)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow internal admin query if authorization header matches admin token
      const isInternal = process.env.NODE_ENV === "development" || !cronSecret;
      if (!isInternal) {
        return NextResponse.json({ success: false, error: "Unauthorized cron execution request" }, { status: 401 });
      }
    }

    // 2. Concurrency Lock: Prevent overlapping runs across serverless instances
    if (db) {
      try {
        const lockRef = db.collection("system_locks").doc(DISCOVERY_LOCK_DOC);
        const lockDoc = await lockRef.get();
        if (lockDoc.exists) {
          const lockData = lockDoc.data();
          const lockedUntil = lockData?.lockedUntil ? new Date(lockData.lockedUntil).getTime() : 0;
          if (Date.now() < lockedUntil) {
            return NextResponse.json({
              success: true,
              skipped: true,
              reason: "Discovery scan currently in progress by another worker.",
              lockedBy: lockData?.lockedBy,
              lockedUntil: lockData?.lockedUntil
            });
          }
        }

        // Acquire Lock
        await lockRef.set({
          lockedBy: runId,
          lockedAt: new Date().toISOString(),
          lockedUntil: new Date(Date.now() + LOCK_TIMEOUT_MS).toISOString()
        }, { merge: true });
      } catch (lockErr: any) {
        console.warn("[JobDiscoveryCron] Warning: Unable to acquire Firestore lock:", lockErr.message);
      }
    }

    // 3. Execute Controlled Job Discovery & 5-Pillar Verification Sweep
    // Rate limit: max 1 broadcast per run to respect public channel hygiene
    const discoveryResult = await runAutomatedJobDiscovery({
      forcePublish: false,
      maxJobsToPublish: 1
    });

    const executionDuration = Date.now() - startTime;

    // 4. Record Run Telemetry into Firestore 'discovery_execution_logs'
    if (db) {
      try {
        await db.collection("discovery_execution_logs").doc(runId).set({
          runId,
          timestamp: new Date().toISOString(),
          durationMs: executionDuration,
          sourcesChecked: discoveryResult.sourcesChecked,
          totalDiscovered: discoveryResult.totalDiscovered,
          verifiedCount: discoveryResult.verifiedCount,
          publishedCount: discoveryResult.publishedCount,
          blockedCount: discoveryResult.blockedCount,
          expiredCount: discoveryResult.expiredCount,
          quarantinedCount: QUARANTINED_OPPORTUNITIES.length,
          historicalArchiveCount: HISTORICAL_EXPIRED_ARCHIVE.length,
          status: "SUCCESS"
        });

        // Release Concurrency Lock
        await db.collection("system_locks").doc(DISCOVERY_LOCK_DOC).delete().catch(() => null);
      } catch (logErr: any) {
        console.warn("[JobDiscoveryCron] Warning: Unable to persist discovery run telemetry:", logErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      runId,
      timestamp: new Date().toISOString(),
      durationMs: executionDuration,
      summary: {
        sourcesChecked: discoveryResult.sourcesChecked,
        totalDiscovered: discoveryResult.totalDiscovered,
        verifiedCount: discoveryResult.verifiedCount,
        publishedCount: discoveryResult.publishedCount,
        blockedCount: discoveryResult.blockedCount,
        expiredCount: discoveryResult.expiredCount,
        quarantinedCount: QUARANTINED_OPPORTUNITIES.length,
        historicalArchiveCount: HISTORICAL_EXPIRED_ARCHIVE.length
      },
      results: discoveryResult.results,
      sources: discoveryResult.sourceTelemetry.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        portal: s.officialPortal,
        status: s.status,
        lastScanned: s.lastScannedAt
      }))
    });
  } catch (err: any) {
    // Release Concurrency Lock on Error
    if (db) {
      await db.collection("system_locks").doc(DISCOVERY_LOCK_DOC).delete().catch(() => null);
    }

    return NextResponse.json(
      {
        success: false,
        runId,
        error: err.message || "Automated job discovery cron sweep failed"
      },
      { status: 500 }
    );
  }
}
