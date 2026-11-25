// ============================================================================
// EXAMHUB INDIA — DURABLE FIRESTORE PUBLISHING QUEUE & RELIABILITY ENGINE
// Cloud Firestore Production Queue (Project: examhub-india-6ba59)
// Uses Firebase Admin SDK exclusively with atomic Firestore transactions
// Shared locks across all Vercel function instances with ₹0 free-tier adherence
// ============================================================================

import crypto from "crypto";
import { parseIndianDeadline } from "./aiJobVerification";
import {
  getFirestoreAdminDb,
  getFirebaseAdminConfigStatus,
  isFirebaseAdminConfigured
} from "./firebaseAdmin";
import {
  getSanitizedTelegramBotToken,
  TELEGRAM_PUBLIC_CHANNEL_ID
} from "./telegramManager";
import { dbStore } from "./data";

export type DeliveryStatus =
  | "PENDING"
  | "RETRYING"
  | "RATE_LIMITED"
  | "SENT"
  | "FAILED"
  | "EXPIRED_IN_QUEUE";

export interface QueueAuditEntry {
  timestamp: string;
  fromStatus: DeliveryStatus;
  toStatus: DeliveryStatus;
  reason: string;
  workerId: string;
}

export interface JobQueueItem {
  id: string; // Firestore document ID: sha256 or q-<id>
  jobId: number | string;
  title: string;
  organization: string;
  locationCategory: string;
  applyUrl: string;
  status: DeliveryStatus;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  lastError: string | null;
  idempotencyKey: string;
  telegramMessageId: number | null;
  channel: string;
  jobData: any;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  lockedBy?: string | null;
  lockedAt?: string | null;
  lockExpiresAt?: string | null;
  auditHistory?: QueueAuditEntry[];
}

export const QUEUE_COLLECTION = "telegram_publishing_queue";
export const IDEMPOTENCY_COLLECTION = "publishing_idempotency_keys";
export const CONFIG_COLLECTION = "telegram_queue_config";

/**
 * Derives a SHA-256 idempotency key preventing duplicate queueing and double-broadcasts.
 */
export function calculateIdempotencyKey(job: any): string {
  const normTitle = String(job.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normOrg = String(job.organization_name || job.organization || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normApply = String(job.official_application_url || job.applyUrl || "").toLowerCase().trim();
  return crypto.createHash("sha256").update(`${normTitle}|${normOrg}|${normApply}`).digest("hex");
}

/**
 * Returns queue telemetry metrics for Admin Cockpit.
 * Reads directly from Firestore when configured.
 */
export async function getQueueTelemetry() {
  const configStatus = getFirebaseAdminConfigStatus();

  if (!configStatus.isConfigured) {
    return {
      isConfigured: false,
      error: configStatus.error,
      projectId: configStatus.projectId,
      queueCount: 0,
      pendingCount: 0,
      retryingCount: 0,
      rateLimitedCount: 0,
      sentCount: 0,
      failedCount: 0,
      expiredInQueueCount: 0,
      permanentErrors: 0,
      nextRetryAt: null,
      lastSuccessfulDeliveryAt: null,
      lastSuccessfulMessageId: null,
      totalQueuedLifetime: 0,
      isChannelThrottled: false,
      channelThrottledUntil: null,
      provider: "FIRESTORE_DISCONNECTED"
    };
  }

  const db = getFirestoreAdminDb();
  if (!db) {
    return {
      isConfigured: false,
      error: "Failed to connect to Cloud Firestore with configured credentials.",
      provider: "FIRESTORE_ERROR"
    };
  }

  try {
    const queueSnapshot = await db.collection(QUEUE_COLLECTION).get();
    const configDoc = await db.collection(CONFIG_COLLECTION).doc("global").get();
    const configData = configDoc.exists ? configDoc.data() : {};

    const nowMs = Date.now();
    let pendingCount = 0;
    let retryingCount = 0;
    let rateLimitedCount = 0;
    let sentCount = 0;
    let failedCount = 0;
    let expiredInQueueCount = 0;
    let earliestNextRetry: number | null = null;

    queueSnapshot.forEach((doc: any) => {
      const item = doc.data() as JobQueueItem;
      if (item.status === "PENDING") pendingCount++;
      else if (item.status === "RETRYING") {
        retryingCount++;
        if (item.nextRetryAt) {
          const ms = new Date(item.nextRetryAt).getTime();
          if (earliestNextRetry === null || ms < earliestNextRetry) earliestNextRetry = ms;
        }
      } else if (item.status === "RATE_LIMITED") {
        rateLimitedCount++;
        if (item.nextRetryAt) {
          const ms = new Date(item.nextRetryAt).getTime();
          if (earliestNextRetry === null || ms < earliestNextRetry) earliestNextRetry = ms;
        }
      } else if (item.status === "SENT") sentCount++;
      else if (item.status === "FAILED") failedCount++;
      else if (item.status === "EXPIRED_IN_QUEUE") expiredInQueueCount++;
    });

    const throttledUntilMs = Number(configData?.channelRateLimitUntilMs) || 0;

    return {
      isConfigured: true,
      provider: "FIREBASE_FIRESTORE_DURABLE",
      projectId: configStatus.projectId,
      collection: QUEUE_COLLECTION,
      queueCount: pendingCount + retryingCount + rateLimitedCount,
      pendingCount,
      retryingCount,
      rateLimitedCount,
      sentCount,
      failedCount,
      expiredInQueueCount,
      permanentErrors: failedCount,
      nextRetryAt: earliestNextRetry ? new Date(earliestNextRetry).toISOString() : null,
      lastSuccessfulDeliveryAt: configData?.lastSuccessfulDeliveryTime || null,
      lastSuccessfulMessageId: configData?.lastSuccessfulMsgId || null,
      totalQueuedLifetime: queueSnapshot.size,
      isChannelThrottled: nowMs < throttledUntilMs,
      channelThrottledUntil: nowMs < throttledUntilMs ? new Date(throttledUntilMs).toISOString() : null
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      error: `Firestore query error: ${err.message}`,
      provider: "FIRESTORE_ERROR"
    };
  }
}

/**
 * Returns items in the delivery queue directly from Firestore.
 */
export async function getQueueItems(limit: number = 50, filterStatus?: string): Promise<JobQueueItem[]> {
  const db = getFirestoreAdminDb();
  if (!db) return [];

  try {
    let query: any = db.collection(QUEUE_COLLECTION);
    if (filterStatus && filterStatus !== "ALL") {
      query = query.where("status", "==", filterStatus);
    }
    const snapshot = await query.orderBy("createdAt", "desc").limit(limit).get();
    const items: JobQueueItem[] = [];
    snapshot.forEach((doc: any) => items.push(doc.data() as JobQueueItem));
    return items;
  } catch (err: any) {
    // If composite index is pending, fallback to un-ordered query
    try {
      const snapshot = await db.collection(QUEUE_COLLECTION).limit(limit).get();
      const items: JobQueueItem[] = [];
      snapshot.forEach((doc: any) => {
        const item = doc.data() as JobQueueItem;
        if (!filterStatus || filterStatus === "ALL" || item.status === filterStatus) {
          items.push(item);
        }
      });
      return items;
    } catch (_) {
      return [];
    }
  }
}

/**
 * Enqueues a verified job into Firestore.
 * Performs duplicate checking using SHA-256 idempotency key collection.
 */
export async function enqueueVerifiedJob(
  job: any,
  options?: {
    customChannel?: string;
    forceImmediate?: boolean;
    locationCategory?: string;
  }
): Promise<{
  queued: boolean;
  duplicateBlocked: boolean;
  item: JobQueueItem;
  immediateResult?: any;
  error?: string;
}> {
  const configStatus = getFirebaseAdminConfigStatus();
  if (!configStatus.isConfigured) {
    return {
      queued: false,
      duplicateBlocked: false,
      item: {
        id: `unconfigured-${Date.now()}`,
        jobId: job.id,
        title: job.title,
        organization: job.organization_name || "",
        locationCategory: options?.locationCategory || "All India",
        applyUrl: job.official_application_url || "",
        status: "FAILED",
        attempts: 0,
        maxAttempts: 4,
        nextRetryAt: null,
        lastError: configStatus.error || "Firebase Admin credentials missing",
        idempotencyKey: "",
        telegramMessageId: null,
        channel: options?.customChannel || TELEGRAM_PUBLIC_CHANNEL_ID,
        jobData: job,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      },
      error: configStatus.error
    };
  }

  const db = getFirestoreAdminDb();
  if (!db) {
    return {
      queued: false,
      duplicateBlocked: false,
      item: {} as any,
      error: "Firestore database connection could not be established."
    };
  }

  const idempotencyKey = calculateIdempotencyKey(job);
  const targetChannel = options?.customChannel || TELEGRAM_PUBLIC_CHANNEL_ID;
  const nowIso = new Date().toISOString();

  // 1. Idempotency Check in Firestore
  const idempotencyRef = db.collection(IDEMPOTENCY_COLLECTION).doc(idempotencyKey);
  const existingKeyDoc = await idempotencyRef.get();
  if (existingKeyDoc.exists) {
    const keyData = existingKeyDoc.data();
    return {
      queued: false,
      duplicateBlocked: true,
      item: {
        id: `dup-${idempotencyKey}`,
        jobId: job.id || "duplicate",
        title: job.title,
        organization: job.organization_name || "",
        locationCategory: options?.locationCategory || "All India",
        applyUrl: job.official_application_url || "",
        status: "SENT",
        attempts: 1,
        maxAttempts: 4,
        nextRetryAt: null,
        lastError: "Duplicate blocked: Job notification already published to channel.",
        idempotencyKey,
        telegramMessageId: keyData?.telegramMessageId || null,
        channel: targetChannel,
        jobData: job,
        createdAt: keyData?.deliveredAt || nowIso,
        updatedAt: nowIso,
        completedAt: keyData?.deliveredAt || nowIso
      }
    };
  }

  // 2. Check if already active in queue collection
  const existingItemQuery = await db
    .collection(QUEUE_COLLECTION)
    .where("idempotencyKey", "==", idempotencyKey)
    .limit(1)
    .get();

  if (!existingItemQuery.empty) {
    const activeItem = existingItemQuery.docs[0].data() as JobQueueItem;
    if (activeItem.status === "PENDING" || activeItem.status === "RETRYING" || activeItem.status === "RATE_LIMITED") {
      return {
        queued: false,
        duplicateBlocked: true,
        item: activeItem
      };
    }
  }

  // 3. Create fresh Queue Item in Firestore
  const docId = `q-${idempotencyKey.slice(0, 16)}`;
  const newItem: JobQueueItem = {
    id: docId,
    jobId: job.id || `gen-${Date.now()}`,
    title: job.title || "Job Notification",
    organization: job.organization_name || job.organization || "Official Authority",
    locationCategory: options?.locationCategory || "All India",
    applyUrl: job.official_application_url || job.applyUrl || "",
    status: "PENDING",
    attempts: 0,
    maxAttempts: 4,
    nextRetryAt: null,
    lastError: null,
    idempotencyKey,
    telegramMessageId: null,
    channel: targetChannel,
    jobData: job,
    createdAt: nowIso,
    updatedAt: nowIso,
    completedAt: null,
    lockedBy: null,
    lockedAt: null,
    lockExpiresAt: null,
    auditHistory: [
      {
        timestamp: nowIso,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        reason: "Job enqueued into Firestore durable queue",
        workerId: "SYSTEM_INGEST"
      }
    ]
  };

  await db.collection(QUEUE_COLLECTION).doc(docId).set(newItem);

  // If immediate dispatch is requested, process via transaction
  if (options?.forceImmediate) {
    const proc = await processQueueItem(newItem);
    return {
      queued: true,
      duplicateBlocked: false,
      item: newItem,
      immediateResult: proc
    };
  }

  return {
    queued: true,
    duplicateBlocked: false,
    item: newItem
  };
}

/**
 * Claims a job for exclusive atomic processing using a Firestore transaction.
 * Shared across all Vercel function instances.
 */
export async function claimJobInFirestoreTransaction(
  db: any,
  itemId: string,
  workerId: string,
  lockDurationMs: number = 30000
): Promise<{ claimed: boolean; item?: JobQueueItem; error?: string }> {
  const itemRef = db.collection(QUEUE_COLLECTION).doc(itemId);

  return db.runTransaction(async (transaction: any) => {
    const doc = await transaction.get(itemRef);
    if (!doc.exists) {
      return { claimed: false, error: "Queue item not found" };
    }

    const data = doc.data() as JobQueueItem;
    const nowMs = Date.now();

    // Check if locked by another active worker
    if (data.lockedBy && data.lockExpiresAt) {
      const expiresMs = new Date(data.lockExpiresAt).getTime();
      if (expiresMs > nowMs && data.lockedBy !== workerId) {
        return { claimed: false, error: `Locked by worker ${data.lockedBy} until ${data.lockExpiresAt}` };
      }
    }

    // Check terminal states
    if (data.status === "SENT" || data.status === "FAILED" || data.status === "EXPIRED_IN_QUEUE") {
      return { claimed: false, error: `Item already in terminal state: ${data.status}` };
    }

    const nowIso = new Date(nowMs).toISOString();
    const lockExpiresAt = new Date(nowMs + lockDurationMs).toISOString();
    const audit = [
      ...(data.auditHistory || []),
      {
        timestamp: nowIso,
        fromStatus: data.status,
        toStatus: data.status,
        reason: `Exclusively claimed by worker ${workerId}`,
        workerId
      }
    ];

    transaction.update(itemRef, {
      lockedBy: workerId,
      lockedAt: nowIso,
      lockExpiresAt,
      updatedAt: nowIso,
      auditHistory: audit
    });

    return {
      claimed: true,
      item: {
        ...data,
        lockedBy: workerId,
        lockedAt: nowIso,
        lockExpiresAt
      }
    };
  });
}

/**
 * Finalizes state transitions in Firestore using a transaction.
 */
export async function finalizeJobInFirestoreTransaction(
  db: any,
  itemId: string,
  toStatus: DeliveryStatus,
  workerId: string,
  options: {
    telegramMessageId?: number;
    retryAfterSec?: number;
    error?: string;
    channelRateLimitUntilMs?: number;
    incrementAttempts?: boolean;
  }
): Promise<void> {
  const itemRef = db.collection(QUEUE_COLLECTION).doc(itemId);
  const configRef = db.collection(CONFIG_COLLECTION).doc("global");
  const idempotencyRef = db.collection(IDEMPOTENCY_COLLECTION);

  await db.runTransaction(async (transaction: any) => {
    const doc = await transaction.get(itemRef);
    if (!doc.exists) return;
    const data = doc.data() as JobQueueItem;
    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    const patch: any = {
      status: toStatus,
      lockedBy: null,
      lockedAt: null,
      lockExpiresAt: null,
      updatedAt: nowIso
    };

    if (options.incrementAttempts) {
      patch.attempts = (data.attempts || 0) + 1;
    }

    if (toStatus === "SENT") {
      patch.completedAt = nowIso;
      patch.telegramMessageId = options.telegramMessageId || null;
      patch.lastError = null;
      patch.nextRetryAt = null;

      // Register idempotency key
      transaction.set(idempotencyRef.doc(data.idempotencyKey), {
        idempotencyKey: data.idempotencyKey,
        jobId: data.jobId,
        title: data.title,
        telegramMessageId: options.telegramMessageId || null,
        deliveredAt: nowIso
      });

      // Update global config stats
      transaction.set(configRef, {
        lastSuccessfulDeliveryTime: nowIso,
        lastSuccessfulMsgId: options.telegramMessageId || null
      }, { merge: true });
    } else if (toStatus === "RATE_LIMITED") {
      const retrySec = options.retryAfterSec || 30;
      patch.nextRetryAt = new Date(nowMs + retrySec * 1000).toISOString();
      patch.lastError = `Telegram HTTP 429: retry_after ${retrySec}s`;
      if (options.channelRateLimitUntilMs) {
        transaction.set(configRef, { channelRateLimitUntilMs: options.channelRateLimitUntilMs }, { merge: true });
      }
    } else if (toStatus === "RETRYING") {
      const currentAttempts = (patch.attempts || data.attempts || 1);
      const delayMs = Math.min(300000, 5000 * Math.pow(2, currentAttempts - 1));
      patch.nextRetryAt = new Date(nowMs + delayMs).toISOString();
      patch.lastError = options.error || "Temporary dispatch failure";
    } else if (toStatus === "FAILED" || toStatus === "EXPIRED_IN_QUEUE") {
      patch.completedAt = nowIso;
      patch.lastError = options.error || `Terminal state: ${toStatus}`;
      patch.nextRetryAt = null;
    }

    patch.auditHistory = [
      ...(data.auditHistory || []),
      {
        timestamp: nowIso,
        fromStatus: data.status,
        toStatus,
        reason: patch.lastError || `Status transitioned to ${toStatus}`,
        workerId
      }
    ];

    transaction.update(itemRef, patch);
  });
}

/**
 * Processes a single queue item via atomic Firestore transaction and Telegram dispatch.
 */
export async function processQueueItem(
  item: JobQueueItem,
  mockDispatcher?: (item: JobQueueItem) => Promise<{ ok: boolean; status?: number; data?: any; error?: string }>,
  workerId: string = `worker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
): Promise<{
  success: boolean;
  status: DeliveryStatus;
  message: string;
  messageId?: number;
}> {
  const db = getFirestoreAdminDb();
  if (!db) {
    return {
      success: false,
      status: "FAILED",
      message: "Firebase Admin Firestore is not configured in Vercel environment variables. Dispatch aborted."
    };
  }

  // 1. ATOMIC TRANSACTION: Claim job lock in Firestore
  const claimResult = await claimJobInFirestoreTransaction(db, item.id, workerId);
  if (!claimResult.claimed) {
    return {
      success: false,
      status: item.status,
      message: `Atomic claim skipped: ${claimResult.error}`
    };
  }

  const claimedItem = claimResult.item || item;
  const nowMs = Date.now();

  try {
    // 2. PRE-FLIGHT EXPIRY RE-CHECK:
    // If the job has expired while sitting in the queue, abort delivery immediately!
    const expiryCheck = parseIndianDeadline(claimedItem.jobData?.application_end_date);
    if (expiryCheck.valid && expiryCheck.isExpired) {
      const errorMsg = `Pre-flight expiry block: Application deadline passed on ${expiryCheck.istString} (Asia/Kolkata). Delivery aborted.`;
      await finalizeJobInFirestoreTransaction(db, claimedItem.id, "EXPIRED_IN_QUEUE", workerId, {
        error: errorMsg
      });

      // Update in-memory dbStore if job exists
      if ((dbStore as any).jobs) {
        const dbJob = (dbStore as any).jobs.find((j: any) => j.id === claimedItem.jobId || j.title === claimedItem.title);
        if (dbJob) {
          dbJob.is_expired = true;
          dbJob.status = "EXPIRED";
          dbJob.application_action_disabled = true;
        }
      }

      return { success: false, status: "EXPIRED_IN_QUEUE", message: errorMsg };
    }

    // 3. Channel Rate-Limit Check
    const configDoc = await db.collection(CONFIG_COLLECTION).doc("global").get();
    const configData = configDoc.exists ? configDoc.data() : {};
    const channelThrottledUntil = Number(configData?.channelRateLimitUntilMs) || 0;

    if (nowMs < channelThrottledUntil) {
      const waitSec = Math.ceil((channelThrottledUntil - nowMs) / 1000);
      const errorMsg = `Telegram channel rate-limited. Global cool-down active for ${waitSec}s.`;
      await finalizeJobInFirestoreTransaction(db, claimedItem.id, "RATE_LIMITED", workerId, {
        retryAfterSec: waitSec,
        error: errorMsg
      });
      return { success: false, status: "RATE_LIMITED", message: errorMsg };
    }

    // 4. Dispatch to Telegram (Real API or injected test harness dispatcher)
    let result: { ok: boolean; status?: number; data?: any; error?: string };
    if (mockDispatcher) {
      result = await mockDispatcher(claimedItem);
    } else {
      result = await dispatchJobToTelegramChannel(claimedItem);
    }

    // A. SUCCESSFUL DISPATCH
    if (result.ok) {
      const msgId = result.data?.result?.message_id || Date.now();
      await finalizeJobInFirestoreTransaction(db, claimedItem.id, "SENT", workerId, {
        telegramMessageId: msgId,
        incrementAttempts: true
      });

      // Update parent job model
      if (claimedItem.jobData) {
        claimedItem.jobData.telegram_posted = true;
        claimedItem.jobData.telegram_posted_at = new Date().toISOString();
        claimedItem.jobData.telegram_message_id = msgId;
      }

      return {
        success: true,
        status: "SENT",
        message: `Successfully published to ${claimedItem.channel} (Message ID: ${msgId}).`,
        messageId: msgId
      };
    }

    // B. RATE LIMITING (HTTP 429)
    const errCode = result.status || result.data?.error_code;
    if (errCode === 429) {
      const retryAfter = result.data?.parameters?.retry_after || 30;
      const retryMs = retryAfter * 1000;
      await finalizeJobInFirestoreTransaction(db, claimedItem.id, "RATE_LIMITED", workerId, {
        retryAfterSec: retryAfter,
        channelRateLimitUntilMs: nowMs + retryMs,
        incrementAttempts: true
      });

      return {
        success: false,
        status: "RATE_LIMITED",
        message: `Telegram API rate limit (HTTP 429). Retry after ${retryAfter}s.`
      };
    }

    // C. PERMANENT PERMISSION ERROR (HTTP 403)
    if (errCode === 403) {
      await finalizeJobInFirestoreTransaction(db, claimedItem.id, "FAILED", workerId, {
        error: "Permanent configuration error (HTTP 403): Bot lacks rights to post in channel.",
        incrementAttempts: true
      });

      return {
        success: false,
        status: "FAILED",
        message: "Permanent configuration error (HTTP 403): Bot lacks rights to post in channel."
      };
    }

    // D. TEMPORARY ERROR (HTTP 500 OR NETWORK)
    const currentAttempts = (claimedItem.attempts || 0) + 1;
    if (currentAttempts >= claimedItem.maxAttempts) {
      await finalizeJobInFirestoreTransaction(db, claimedItem.id, "FAILED", workerId, {
        error: `Exceeded maximum retry attempts (${currentAttempts}/${claimedItem.maxAttempts}).`,
        incrementAttempts: true
      });
      return {
        success: false,
        status: "FAILED",
        message: `Exceeded maximum retry attempts (${currentAttempts}/${claimedItem.maxAttempts}).`
      };
    }

    await finalizeJobInFirestoreTransaction(db, claimedItem.id, "RETRYING", workerId, {
      error: result.error || result.data?.description || `Temporary HTTP ${errCode} error`,
      incrementAttempts: true
    });

    return {
      success: false,
      status: "RETRYING",
      message: `Temporary dispatch failure: ${result.error || result.data?.description}. Scheduled retry.`
    };
  } catch (err: any) {
    await finalizeJobInFirestoreTransaction(db, claimedItem.id, "RETRYING", workerId, {
      error: `Network failure: ${err.message}`,
      incrementAttempts: true
    });
    return { success: false, status: "RETRYING", message: err.message };
  }
}

/**
 * Dispatches an item directly to Telegram channel using fetch.
 */
async function dispatchJobToTelegramChannel(item: JobQueueItem): Promise<{
  ok: boolean;
  status?: number;
  data?: any;
  error?: string;
}> {
  const token = getSanitizedTelegramBotToken();
  if (!token) {
    return { ok: false, error: "Missing TELEGRAM_BOT_TOKEN" };
  }

  const html = formatJobPostHtml(item.jobData, item.locationCategory);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: item.channel,
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: false
      })
    });

    const data = await res.json();
    return {
      ok: res.ok && data.ok,
      status: res.status,
      data
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message
    };
  }
}

/**
 * Formats clean, error-free HTML for Telegram channel broadcast.
 */
function formatJobPostHtml(job: any, locationCategory: string = "All India"): string {
  const escape = (s: any) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const title = escape(job.title || "Recruitment Opening");
  const org = escape(job.organization_name || job.organization || "Official Authority");
  const vacancies = job.vacancies_count || job.total_vacancies || null;
  const qual = escape(job.qualification || "Verify from official notification");
  const loc = escape(job.location || locationCategory);
  const deadline = escape(job.application_end_date ? new Date(job.application_end_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }) : "Verify from official notification");
  const applyUrl = job.official_application_url || job.official_apply_url || "https://examhub-india.vercel.app/jobs";
  const pdfUrl = job.official_notification_pdf || null;

  let msg = `🚨 <b>NEW VERIFIED JOB NOTIFICATION</b>\n\n`;
  msg += `🏢 <b>Organization:</b> ${org}\n`;
  msg += `💼 <b>Role:</b> ${title}\n`;
  if (vacancies) msg += `👥 <b>Vacancies:</b> ${vacancies}\n`;
  msg += `🎓 <b>Qualification:</b> ${qual}\n`;
  msg += `📍 <b>Location:</b> ${loc} [${escape(locationCategory)}]\n`;
  msg += `📅 <b>Last Date:</b> ${deadline} (23:59:59 IST)\n\n`;
  if (pdfUrl) msg += `📄 <b>Official PDF:</b> <a href="${pdfUrl}">View Gazette Notification</a>\n`;
  msg += `🔗 <b>Official Portal:</b> <a href="${applyUrl}">Apply Online Directly</a>\n\n`;
  msg += `🛡️ <i>Verified by ExamHub India AI Autonomous Guardian (5-Pillar Checked)</i>\n`;
  msg += `🌐 <b>ExamHub Portal:</b> https://examhub-india.vercel.app`;

  return msg;
}

/**
 * Processes all eligible items in Firestore (PENDING, or RETRYING/RATE_LIMITED whose nextRetryAt has arrived).
 */
export async function processEligibleQueue(options?: {
  forceAll?: boolean;
  mockDispatcher?: (item: JobQueueItem) => Promise<any>;
  workerId?: string;
}): Promise<{
  processed: number;
  sent: number;
  retrying: number;
  rateLimited: number;
  failed: number;
  expiredInQueue: number;
  error?: string;
}> {
  const db = getFirestoreAdminDb();
  if (!db) {
    return {
      processed: 0,
      sent: 0,
      retrying: 0,
      rateLimited: 0,
      failed: 0,
      expiredInQueue: 0,
      error: "Firebase Admin Firestore credentials not configured."
    };
  }

  const nowMs = Date.now();
  let processed = 0;
  let sent = 0;
  let retrying = 0;
  let rateLimited = 0;
  let failed = 0;
  let expiredInQueue = 0;
  const worker = options?.workerId || `worker-${Date.now()}`;

  try {
    const snapshot = await db.collection(QUEUE_COLLECTION).get();
    for (const doc of snapshot.docs) {
      const item = doc.data() as JobQueueItem;
      if (item.status === "SENT" || item.status === "FAILED" || item.status === "EXPIRED_IN_QUEUE") {
        continue;
      }

      const isPending = item.status === "PENDING";
      const retryDue = item.nextRetryAt && new Date(item.nextRetryAt).getTime() <= nowMs;
      const eligible = isPending || retryDue || options?.forceAll;

      if (eligible) {
        processed++;
        const res = await processQueueItem(item, options?.mockDispatcher, worker);
        if (res.status === "SENT") sent++;
        else if (res.status === "RETRYING") retrying++;
        else if (res.status === "RATE_LIMITED") rateLimited++;
        else if (res.status === "FAILED") failed++;
        else if (res.status === "EXPIRED_IN_QUEUE") expiredInQueue++;
      }
    }

    return {
      processed,
      sent,
      retrying,
      rateLimited,
      failed,
      expiredInQueue
    };
  } catch (err: any) {
    return {
      processed,
      sent,
      retrying,
      rateLimited,
      failed,
      expiredInQueue,
      error: err.message
    };
  }
}

/**
 * Administrator manual trigger: Immediately retries all pending, retrying, and rate-limited items.
 */
export async function retryPendingNow(): Promise<{
  success: boolean;
  processedCount: number;
  message: string;
}> {
  const db = getFirestoreAdminDb();
  if (!db) {
    return {
      success: false,
      processedCount: 0,
      message: "Cannot retry: Firebase Admin Firestore is not configured in Vercel environment variables."
    };
  }

  // Clear global rate limit cool-down
  await db.collection(CONFIG_COLLECTION).doc("global").set({ channelRateLimitUntilMs: 0 }, { merge: true });

  const result = await processEligibleQueue({ forceAll: true });
  return {
    success: true,
    processedCount: result.processed,
    message: `Firestore Queue Processed: ${result.sent} sent, ${result.retrying} retrying, ${result.rateLimited} rate-limited, ${result.expiredInQueue} blocked as expired, ${result.failed} failed.`
  };
}

/**
 * Migrates existing 4 real pending jobs safely into Firestore.
 * Preserves original data, verification evidence, status, and avoids auto-broadcast.
 */
export async function migrateJobsToFirestore(
  jobsToMigrate: any[]
): Promise<{ migratedCount: number; skippedDuplicates: number; errors: string[] }> {
  const db = getFirestoreAdminDb();
  if (!db) return { migratedCount: 0, skippedDuplicates: 0, errors: ["Firestore not configured"] };

  let migratedCount = 0;
  let skippedDuplicates = 0;
  const errors: string[] = [];

  for (const job of jobsToMigrate) {
    try {
      const key = calculateIdempotencyKey(job);
      const docId = `q-${key.slice(0, 16)}`;
      const docRef = db.collection(QUEUE_COLLECTION).doc(docId);
      const existing = await docRef.get();

      if (existing.exists) {
        skippedDuplicates++;
        continue;
      }

      const item: JobQueueItem = {
        id: docId,
        jobId: job.id,
        title: job.title,
        organization: job.organization_name || job.organization || "Official Authority",
        locationCategory: job.location?.toLowerCase().includes("chennai")
          ? "Chennai"
          : job.location?.toLowerCase().includes("remote")
          ? "Remote"
          : "All India",
        applyUrl: job.official_application_url || "",
        status: "PENDING",
        attempts: 0,
        maxAttempts: 4,
        nextRetryAt: null,
        lastError: null,
        idempotencyKey: key,
        telegramMessageId: null,
        channel: TELEGRAM_PUBLIC_CHANNEL_ID,
        jobData: job,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        auditHistory: [
          {
            timestamp: new Date().toISOString(),
            fromStatus: "PENDING",
            toStatus: "PENDING",
            reason: "Initial migration into Cloud Firestore production queue",
            workerId: "MIGRATION_SCRIPT"
          }
        ]
      };

      await docRef.set(item);
      migratedCount++;
    } catch (e: any) {
      errors.push(e.message);
    }
  }

  return { migratedCount, skippedDuplicates, errors };
}
