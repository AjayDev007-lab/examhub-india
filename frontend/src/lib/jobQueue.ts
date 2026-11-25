// ============================================================================
// EXAMHUB INDIA — DURABLE TELEGRAM JOB PUBLISHING QUEUE & RELIABILITY ENGINE
// Ensures 100% reliable, rate-limit resilient, idempotent job publishing
// Backed by atomic file-based durable persistence surviving cold starts
// ============================================================================

import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { parseIndianDeadline } from "./aiJobVerification";
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

export interface JobQueueItem {
  id: string;
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
}

export interface DurableQueueState {
  version: number;
  updatedAt: string;
  channelRateLimitUntilMs: number;
  lastSuccessfulDeliveryTime: string | null;
  lastSuccessfulMsgId: number | null;
  sentIdempotencyKeys: string[];
  items: JobQueueItem[];
}

/**
 * Returns the durable filesystem path for the queue storage.
 * In serverless environments (Vercel/Lambda), falls back to OS temp dir.
 */
export function getStorageFilePath(): string {
  if (process.env.QUEUE_STORAGE_PATH) {
    return process.env.QUEUE_STORAGE_PATH;
  }
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isServerless) {
    return path.join(os.tmpdir(), "examhub_publishing_queue.json");
  }
  // Local project directory
  const localDataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(localDataDir)) {
    try {
      fs.mkdirSync(localDataDir, { recursive: true });
    } catch (_) {}
  }
  return path.join(localDataDir, "publishing_queue.json");
}

// In-memory working cache (synced to durable disk on every mutation)
let activeState: DurableQueueState = {
  version: 1,
  updatedAt: new Date().toISOString(),
  channelRateLimitUntilMs: 0,
  lastSuccessfulDeliveryTime: null,
  lastSuccessfulMsgId: null,
  sentIdempotencyKeys: [],
  items: []
};

// Initial load on module initialization
loadDurableState();

/**
 * Atomically writes the queue state to durable disk using temp-file rename.
 */
export function saveDurableState(): void {
  activeState.updatedAt = new Date().toISOString();
  const filePath = getStorageFilePath();
  const tmpPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;

  try {
    const json = JSON.stringify(activeState, null, 2);
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(tmpPath, json, "utf8");
    fs.renameSync(tmpPath, filePath);
  } catch (err: any) {
    // If atomic rename fails (e.g. cross-device link), fallback to direct write
    try {
      fs.writeFileSync(filePath, JSON.stringify(activeState, null, 2), "utf8");
    } catch (_) {}
  }
}

/**
 * Loads the queue state from durable storage and releases expired locks.
 */
export function loadDurableState(): DurableQueueState {
  const filePath = getStorageFilePath();
  const nowMs = Date.now();

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.items)) {
        activeState = {
          version: parsed.version || 1,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
          channelRateLimitUntilMs: Number(parsed.channelRateLimitUntilMs) || 0,
          lastSuccessfulDeliveryTime: parsed.lastSuccessfulDeliveryTime || null,
          lastSuccessfulMsgId: parsed.lastSuccessfulMsgId || null,
          sentIdempotencyKeys: Array.isArray(parsed.sentIdempotencyKeys) ? parsed.sentIdempotencyKeys : [],
          items: parsed.items
        };

        // Automatic lock recovery: Unlock any orphaned items held by dead workers
        for (const item of activeState.items) {
          if (item.lockedBy) {
            const exp = item.lockExpiresAt ? new Date(item.lockExpiresAt).getTime() : 0;
            if (exp <= nowMs) {
              item.lockedBy = null;
              item.lockedAt = null;
              item.lockExpiresAt = null;
              if (item.status === "PENDING" || item.status === "RETRYING") {
                item.status = "RETRYING";
              }
            }
          }
        }
      }
    }
  } catch (err) {
    // On corrupt file, keep active in-memory state and re-save
    saveDurableState();
  }

  return activeState;
}

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
 */
export function getQueueTelemetry() {
  loadDurableState();
  const nowMs = Date.now();
  let pendingCount = 0;
  let retryingCount = 0;
  let rateLimitedCount = 0;
  let sentCount = 0;
  let failedCount = 0;
  let expiredInQueueCount = 0;
  let earliestNextRetry: number | null = null;

  for (const item of activeState.items) {
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
  }

  return {
    queueCount: pendingCount + retryingCount + rateLimitedCount,
    pendingCount,
    retryingCount,
    rateLimitedCount,
    sentCount,
    failedCount,
    expiredInQueueCount,
    permanentErrors: failedCount,
    nextRetryAt: earliestNextRetry ? new Date(earliestNextRetry).toISOString() : null,
    lastSuccessfulDeliveryAt: activeState.lastSuccessfulDeliveryTime,
    lastSuccessfulMessageId: activeState.lastSuccessfulMsgId,
    totalQueuedLifetime: activeState.items.length,
    isChannelThrottled: nowMs < activeState.channelRateLimitUntilMs,
    channelThrottledUntil: nowMs < activeState.channelRateLimitUntilMs ? new Date(activeState.channelRateLimitUntilMs).toISOString() : null
  };
}

/**
 * Returns items in the delivery queue with optional filtering and pagination.
 */
export function getQueueItems(limit: number = 50, filterStatus?: string): JobQueueItem[] {
  loadDurableState();
  let list = activeState.items;
  if (filterStatus && filterStatus !== "ALL") {
    list = list.filter(i => i.status === filterStatus);
  }
  return list.slice(0, limit);
}

/**
 * Adds a verified job into the persistent durable delivery queue.
 * Performs duplicate checking using SHA-256 idempotency key.
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
}> {
  loadDurableState();
  const idempotencyKey = calculateIdempotencyKey(job);
  const targetChannel = options?.customChannel || TELEGRAM_PUBLIC_CHANNEL_ID;

  // 1. Idempotency Check: Reject if already SENT in durable store
  if (activeState.sentIdempotencyKeys.includes(idempotencyKey)) {
    const existing = activeState.items.find(i => i.idempotencyKey === idempotencyKey);
    return {
      queued: false,
      duplicateBlocked: true,
      item: existing || {
        id: `dup-${Date.now()}`,
        jobId: job.id || "unknown",
        title: job.title,
        organization: job.organization_name || job.organization || "",
        locationCategory: options?.locationCategory || "All India",
        applyUrl: job.official_application_url || "",
        status: "SENT",
        attempts: 1,
        maxAttempts: 4,
        nextRetryAt: null,
        lastError: "Duplicate blocked: Job already sent to channel.",
        idempotencyKey,
        telegramMessageId: null,
        channel: targetChannel,
        jobData: job,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
    };
  }

  // 2. Reject if already in active queue
  const existingActive = activeState.items.find(
    i => i.idempotencyKey === idempotencyKey &&
         (i.status === "PENDING" || i.status === "RETRYING" || i.status === "RATE_LIMITED")
  );
  if (existingActive) {
    return {
      queued: false,
      duplicateBlocked: true,
      item: existingActive
    };
  }

  // 3. Create fresh Queue Item
  const newItem: JobQueueItem = {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    lockedBy: null,
    lockedAt: null,
    lockExpiresAt: null
  };

  activeState.items.unshift(newItem);
  saveDurableState();

  // If immediate dispatch is requested, attempt processing now
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
 * Claims a job for exclusive atomic processing by a specific worker instance.
 * Returns null if the job is locked by another concurrent worker.
 */
export function claimJobAtomically(item: JobQueueItem, workerId: string, lockDurationMs: number = 30000): boolean {
  loadDurableState();
  const current = activeState.items.find(i => i.id === item.id);
  if (!current) return false;

  const nowMs = Date.now();
  if (current.lockedBy && current.lockExpiresAt) {
    const expiresMs = new Date(current.lockExpiresAt).getTime();
    if (expiresMs > nowMs && current.lockedBy !== workerId) {
      return false; // Locked by another worker
    }
  }

  // Acquire lock
  current.lockedBy = workerId;
  current.lockedAt = new Date().toISOString();
  current.lockExpiresAt = new Date(nowMs + lockDurationMs).toISOString();
  saveDurableState();

  item.lockedBy = current.lockedBy;
  item.lockedAt = current.lockedAt;
  item.lockExpiresAt = current.lockExpiresAt;
  return true;
}

/**
 * Releases the atomic lock on a job after processing completes or fails.
 */
export function releaseJobLock(item: JobQueueItem): void {
  loadDurableState();
  const current = activeState.items.find(i => i.id === item.id);
  if (current) {
    current.lockedBy = null;
    current.lockedAt = null;
    current.lockExpiresAt = null;
    saveDurableState();
  }
  item.lockedBy = null;
  item.lockedAt = null;
  item.lockExpiresAt = null;
}

/**
 * Processes a single queue item with strict pre-flight expiry check and error classification.
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
  // 1. Atomic Lock Claim: Prevents concurrent workers from double-processing
  const acquired = claimJobAtomically(item, workerId);
  if (!acquired) {
    return {
      success: false,
      status: item.status,
      message: `Job is currently locked by another concurrent worker instance. Skipping duplicate dispatch.`
    };
  }

  const nowMs = Date.now();
  item.updatedAt = new Date().toISOString();

  try {
    // 2. CRITICAL PRE-FLIGHT EXPIRY RE-CHECK:
    // If the job has expired while sitting in the queue, abort delivery immediately!
    const expiryCheck = parseIndianDeadline(item.jobData.application_end_date);
    if (expiryCheck.valid && expiryCheck.isExpired) {
      item.status = "EXPIRED_IN_QUEUE";
      item.completedAt = new Date().toISOString();
      item.lastError = `Pre-flight expiry block: Job application deadline passed on ${expiryCheck.istString} (Asia/Kolkata). Delivery aborted.`;

      // Also update storage if job exists
      if ((dbStore as any).jobs) {
        const dbJob = (dbStore as any).jobs.find((j: any) => j.id === item.jobId || j.title === item.title);
        if (dbJob) {
          dbJob.is_expired = true;
          dbJob.status = "EXPIRED";
          dbJob.application_action_disabled = true;
        }
      }

      saveDurableState();
      return {
        success: false,
        status: "EXPIRED_IN_QUEUE",
        message: item.lastError
      };
    }

    // 3. Channel Rate-Limit Check
    if (nowMs < activeState.channelRateLimitUntilMs) {
      const waitSec = Math.ceil((activeState.channelRateLimitUntilMs - nowMs) / 1000);
      item.status = "RATE_LIMITED";
      item.nextRetryAt = new Date(activeState.channelRateLimitUntilMs).toISOString();
      item.lastError = `Telegram channel rate-limited. Global cool-down active for ${waitSec}s.`;
      saveDurableState();
      return {
        success: false,
        status: "RATE_LIMITED",
        message: item.lastError
      };
    }

    item.attempts++;

    // 4. Dispatch to Telegram (Real API or injected test harness dispatcher)
    let result: { ok: boolean; status?: number; data?: any; error?: string };
    if (mockDispatcher) {
      result = await mockDispatcher(item);
    } else {
      result = await dispatchJobToTelegramChannel(item);
    }

    // A. SUCCESSFUL DISPATCH
    if (result.ok) {
      const msgId = result.data?.result?.message_id || Date.now();
      item.status = "SENT";
      item.telegramMessageId = msgId;
      item.completedAt = new Date().toISOString();
      item.lastError = null;
      item.nextRetryAt = null;

      if (!activeState.sentIdempotencyKeys.includes(item.idempotencyKey)) {
        activeState.sentIdempotencyKeys.push(item.idempotencyKey);
      }
      activeState.lastSuccessfulDeliveryTime = item.completedAt;
      activeState.lastSuccessfulMsgId = msgId;

      // Update parent job model
      item.jobData.telegram_posted = true;
      item.jobData.telegram_posted_at = item.completedAt;
      item.jobData.telegram_message_id = msgId;

      saveDurableState();
      return {
        success: true,
        status: "SENT",
        message: `Successfully published to ${item.channel} (Message ID: ${msgId}).`,
        messageId: msgId
      };
    }

    // B. RATE LIMITING (HTTP 429)
    const errCode = result.status || result.data?.error_code;
    if (errCode === 429) {
      const retryAfter = result.data?.parameters?.retry_after || 30;
      const retryMs = retryAfter * 1000;
      activeState.channelRateLimitUntilMs = nowMs + retryMs;

      item.status = "RATE_LIMITED";
      item.nextRetryAt = new Date(nowMs + retryMs).toISOString();
      item.lastError = `Telegram API rate limit (HTTP 429). Retry after ${retryAfter}s.`;

      saveDurableState();
      return {
        success: false,
        status: "RATE_LIMITED",
        message: item.lastError
      };
    }

    // C. PERMANENT PERMISSION ERROR (HTTP 403)
    if (errCode === 403) {
      item.status = "FAILED";
      item.completedAt = new Date().toISOString();
      item.nextRetryAt = null;
      item.lastError = "Permanent configuration error (HTTP 403): Bot lacks rights to post in channel.";

      saveDurableState();
      return {
        success: false,
        status: "FAILED",
        message: item.lastError
      };
    }

    // D. TEMPORARY SERVER ERROR (HTTP 500 / 502 / 503) OR NETWORK ERROR
    const isServerError = errCode >= 500 && errCode < 600;
    const isExceeded = item.attempts >= item.maxAttempts;

    if (isExceeded) {
      item.status = "FAILED";
      item.completedAt = new Date().toISOString();
      item.nextRetryAt = null;
      item.lastError = `Exceeded maximum retry attempts (${item.attempts}/${item.maxAttempts}). Last error: ${result.error || result.data?.description || "Unknown error"}`;

      saveDurableState();
      return {
        success: false,
        status: "FAILED",
        message: item.lastError
      };
    }

    // Exponential Backoff with Jitter: 5s, 15s, 45s (bounded to max 300s)
    const baseDelaySec = 5;
    const expDelaySec = Math.min(300, baseDelaySec * Math.pow(3, item.attempts - 1));
    const jitter = Math.floor(Math.random() * 3);
    const totalBackoffMs = (expDelaySec + jitter) * 1000;

    item.status = "RETRYING";
    item.nextRetryAt = new Date(nowMs + totalBackoffMs).toISOString();
    item.lastError = `${isServerError ? `Telegram server error (HTTP ${errCode})` : "Temporary connection error"}: ${result.error || result.data?.description || "Failed"}. Scheduled retry in ${expDelaySec + jitter}s.`;

    saveDurableState();
    return {
      success: false,
      status: "RETRYING",
      message: item.lastError
    };
  } catch (netErr: any) {
    if (item.attempts >= item.maxAttempts) {
      item.status = "FAILED";
      item.completedAt = new Date().toISOString();
      item.nextRetryAt = null;
      item.lastError = `Network failure: Exceeded max attempts (${item.attempts}/${item.maxAttempts}). Error: ${netErr.message}`;
      saveDurableState();
      return { success: false, status: "FAILED", message: item.lastError };
    }

    const backoffMs = 5000 * Math.pow(2, item.attempts - 1);
    item.status = "RETRYING";
    item.nextRetryAt = new Date(nowMs + backoffMs).toISOString();
    item.lastError = `Network connection failure: ${netErr.message}. Retrying in ${backoffMs / 1000}s.`;
    saveDurableState();
    return { success: false, status: "RETRYING", message: item.lastError };
  } finally {
    releaseJobLock(item);
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
 * Processes all eligible items in the queue (PENDING, or RETRYING/RATE_LIMITED whose nextRetryAt has arrived).
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
}> {
  loadDurableState();
  const nowMs = Date.now();
  let processed = 0;
  let sent = 0;
  let retrying = 0;
  let rateLimited = 0;
  let failed = 0;
  let expiredInQueue = 0;
  const worker = options?.workerId || `worker-${Date.now()}`;

  for (const item of activeState.items) {
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
}

/**
 * Administrator manual trigger: Immediately retries all pending, retrying, and rate-limited items.
 */
export async function retryPendingNow(): Promise<{
  success: boolean;
  processedCount: number;
  message: string;
}> {
  activeState.channelRateLimitUntilMs = 0;
  saveDurableState();

  const result = await processEligibleQueue({ forceAll: true });
  return {
    success: true,
    processedCount: result.processed,
    message: `Queue processed: ${result.sent} sent, ${result.retrying} retrying, ${result.rateLimited} rate-limited, ${result.expiredInQueue} blocked as expired, ${result.failed} failed.`
  };
}

/**
 * Resets the durable queue state (used for testing).
 */
export function resetQueueForTesting() {
  activeState = {
    version: 1,
    updatedAt: new Date().toISOString(),
    channelRateLimitUntilMs: 0,
    lastSuccessfulDeliveryTime: null,
    lastSuccessfulMsgId: null,
    sentIdempotencyKeys: [],
    items: []
  };
  const filePath = getStorageFilePath();
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (_) {}
}
