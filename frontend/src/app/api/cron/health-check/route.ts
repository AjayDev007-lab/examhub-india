// ============================================================================
// EXAMHUB INDIA — 24/7 AUTOMATED GUARDIAN HEALTH CHECK CRON
// Periodic self-test, failure detection, safe auto-recovery & admin alerting
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  runFullSystemHealthCheck,
  dispatchDeduplicatedAlert,
  resolveAlertAndNotifyRecovery,
  executeSafeRecovery
} from "@/lib/guardianMonitoring";
import { TELEGRAM_ADMIN_USERNAME, TELEGRAM_DEFAULT_ADMIN_CHAT_ID } from "@/lib/telegramManager";
import { dbStore } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Run live health check across all modules
    const health = await runFullSystemHealthCheck();

    // 2. Failure Detection & Alerting
    const alertsDispatched: any[] = [];

    // Check endpoints
    const failedEndpoints = health.endpoints.filter(e => e.status === "CRITICAL");
    if (failedEndpoints.length > 0) {
      const alertRes = await dispatchDeduplicatedAlert({
        system: "Website & API Services",
        severity: "CRITICAL",
        issue: `${failedEndpoints.length} critical endpoint failure(s): ${failedEndpoints.map(e => `${e.name} (${e.httpStatus || "timeout"})`).join(", ")}`,
        impact: "Students and applicants may experience partial or complete service unavailability",
        action: "Logged failure details and initiated safe health check retry",
        adminActionRequired: true
      });
      alertsDispatched.push(alertRes);
    }

    // Check Telegram Bot
    if (health.telegramBot.status === "CRITICAL") {
      const alertRes = await dispatchDeduplicatedAlert({
        system: "Telegram AI Guardian Bot",
        severity: "CRITICAL",
        issue: `Telegram bot verification failed: ${health.telegramBot.lastError || "Bot offline or permissions revoked"}`,
        impact: "Approval requests and channel notifications are suspended",
        action: "Attempting webhook verification and credentials check",
        adminActionRequired: true
      });
      alertsDispatched.push(alertRes);
    }

    // Check Job Scanner
    if (health.jobScanner.isStalled) {
      const alertRes = await dispatchDeduplicatedAlert({
        system: "Job & Exam Scanner",
        severity: "WARNING",
        issue: `Automatic job detection scan has been delayed: ${health.jobScanner.error}`,
        impact: "New government job openings and exam notices may not be discovered promptly",
        action: "Queued background rescan schedule",
        adminActionRequired: false
      });
      alertsDispatched.push(alertRes);
    }

    // Check Publishing Pipeline
    if (health.publishingPipeline.failedPublishingAttempts > 0) {
      const alertRes = await dispatchDeduplicatedAlert({
        system: "Publishing Pipeline",
        severity: "WARNING",
        issue: `${health.publishingPipeline.failedPublishingAttempts} job(s) failed Telegram channel publication`,
        impact: "Channel subscribers have not received recent vacancy alerts",
        action: "Triggering automatic safe retry with bounded exponential backoff",
        adminActionRequired: false
      });
      alertsDispatched.push(alertRes);
    }

    // 3. Execute Safe Automatic Recovery
    const recoveryResult = await executeSafeRecovery();

    // 4. If all systems are now healthy, resolve any lingering alerts
    if (health.overallStatus === "HEALTHY") {
      await resolveAlertAndNotifyRecovery({
        system: "Website & API Services",
        actionTaken: "All website and API endpoints verified online and responsive"
      });
      await resolveAlertAndNotifyRecovery({
        system: "Telegram AI Guardian Bot",
        actionTaken: "Bot API connectivity and webhook delivery re-established"
      });
      await resolveAlertAndNotifyRecovery({
        system: "Publishing Pipeline",
        actionTaken: "Publishing pipeline queue cleared and verified"
      });
    }

    // Record audit log
    if (dbStore.auditLogs) {
      dbStore.auditLogs.unshift({
        id: Date.now(),
        action: "CRON_247_HEALTH_CHECK_COMPLETED",
        target: TELEGRAM_ADMIN_USERNAME,
        performed_by: "AI_GUARDIAN_CRON",
        risk: "LOW",
        status: health.overallStatus === "CRITICAL" ? "WARNING" : "SUCCESS",
        timestamp: new Date().toISOString(),
        details: `Overall: ${health.overallStatus}, Recovery actions taken: ${recoveryResult.actionsTakenCount}`
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overallStatus: health.overallStatus,
      recipient: TELEGRAM_ADMIN_USERNAME,
      chatId: TELEGRAM_DEFAULT_ADMIN_CHAT_ID,
      health,
      alertsDispatched,
      recoveryResult
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute 24/7 health check cron" },
      { status: 500 }
    );
  }
}
