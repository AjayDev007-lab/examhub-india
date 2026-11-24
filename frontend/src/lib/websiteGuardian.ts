// ============================================================================
// EXAMHUB INDIA — 24/7 AI WEBSITE GUARDIAN ENGINE (PHASE 6)
// Continuous Scheduled & Event-Driven Monitoring, Instant Problem Detection,
// Automatic Safe Repairs with Full Rollback, and Telegram Guardian Alerts.
// Strictly compliant with Vercel serverless lifecycle and Hobby cron quotas.
// ============================================================================

import fs from "fs";
import path from "path";
import os from "os";
import {
  sendTelegramAdminAlert,
  TELEGRAM_ADMIN_USERNAME,
  TELEGRAM_DEFAULT_ADMIN_CHAT_ID,
  TELEGRAM_BOT_USERNAME
} from "./telegramManager";
import { dbStore, initialJobs } from "./data";
import { initialITJobs, initialUniversityQuestionPapers, initialSchoolChapters } from "./platformData";

export type GuardianSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type GuardianIssueType =
  | "DOWNTIME"
  | "BROKEN_LINK"
  | "HTTP_ERROR"
  | "MISSING_PDF"
  | "EXPIRED_JOB"
  | "INCORRECT_DEADLINE"
  | "MISSING_NOTE"
  | "MISSING_PAPER"
  | "API_FAILURE"
  | "DATABASE_ERROR"
  | "PUBLISH_FAILURE"
  | "TELEGRAM_FAILURE";

export type GuardianIssueStatus =
  | "DETECTED"
  | "AWAITING_APPROVAL"
  | "REPAIRED"
  | "REJECTED"
  | "FAILED"
  | "RESOLVED";

export interface GuardianIssue {
  id: string;
  type: GuardianIssueType;
  severity: GuardianSeverity;
  section: string;
  targetUrl?: string;
  resourceId?: string | number;
  title: string;
  description: string;
  aiRecommendation: string;
  status: GuardianIssueStatus;
  detectedAt: string;
  resolvedAt?: string;
  repairId?: string;
  attemptsCount: number;
}

export interface GuardianRepair {
  id: string;
  issueId: string;
  actionType: "ARCHIVE_EXPIRED_JOB" | "REPLACE_BROKEN_LINK" | "RESTORE_CANONICAL_REF" | "RETRY_TRANSIENT_FAILURE";
  targetResource: string;
  targetIdentifier: string | number;
  originalValue: any;
  proposedValue: any;
  appliedValue?: any;
  requiresAdminApproval: boolean;
  status: "PROPOSED" | "APPROVED" | "EXECUTED" | "REJECTED" | "ROLLED_BACK" | "FAILED";
  executedAt?: string;
  rolledBackAt?: string;
  executedBy?: string;
  rollbackReason?: string;
  createdAt: string;
}

export interface GuardianConfig {
  enabled: boolean;
  autoRepairEnabled: boolean;
  alertSeverityThreshold: GuardianSeverity;
  quietHours: {
    enabled: boolean;
    startHour: number; // e.g. 23 (11 PM)
    endHour: number;   // e.g. 7 (7 AM)
    allowCritical: boolean;
  };
  scanConcurrency: number;
  rateLimitPerMinute: number;
  lastScanAt?: string;
  nextScheduledScanAt?: string;
  lastHealthScore: number;
}

export interface GuardianScanResult {
  scanId: string;
  scanType: "FULL" | "LINKS" | "CONTENT" | "JOB_EXPIRY";
  startedAt: string;
  completedAt: string;
  durationMs: number;
  status: "COMPLETED" | "PARTIAL" | "FAILED";
  endpointsScanned: number;
  linksChecked: number;
  jobsChecked: number;
  papersChecked: number;
  schoolChaptersChecked: number;
  issuesFound: number;
  repairsTriggered: number;
  healthScore: number;
  issues: GuardianIssue[];
}

// File persistence paths in serverless /tmp
const GUARDIAN_CONFIG_FILE = path.join(os.tmpdir(), "examhub_guardian_config.json");
const GUARDIAN_ISSUES_FILE = path.join(os.tmpdir(), "examhub_guardian_issues.json");
const GUARDIAN_REPAIRS_FILE = path.join(os.tmpdir(), "examhub_guardian_repairs.json");
const GUARDIAN_SCANS_FILE = path.join(os.tmpdir(), "examhub_guardian_scans.json");

// Deduplication cooldown window (15 minutes)
const DEDUPLICATION_WINDOW_MS = 15 * 60 * 1000;
const alertDeduplicationMap = new Map<string, number>();

// In-memory recovery tracker (tracks previous failures to announce recovery)
const serviceFailureTracker = new Map<string, { failedAt: string; consecutiveFailures: number }>();

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (_) {}
  return fallback;
}

function writeJson<T>(filePath: string, data: T): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (_) {}
}

// Default Configuration
const DEFAULT_CONFIG: GuardianConfig = {
  enabled: true,
  autoRepairEnabled: true,
  alertSeverityThreshold: "HIGH",
  quietHours: {
    enabled: false,
    startHour: 23,
    endHour: 6,
    allowCritical: true
  },
  scanConcurrency: 3,
  rateLimitPerMinute: 60,
  lastHealthScore: 100
};

export function getGuardianConfig(): GuardianConfig {
  return readJson<GuardianConfig>(GUARDIAN_CONFIG_FILE, DEFAULT_CONFIG);
}

export function updateGuardianConfig(patch: Partial<GuardianConfig>): GuardianConfig {
  const current = getGuardianConfig();
  const updated = { ...current, ...patch };
  writeJson(GUARDIAN_CONFIG_FILE, updated);
  return updated;
}

export function getGuardianIssues(): GuardianIssue[] {
  return readJson<GuardianIssue[]>(GUARDIAN_ISSUES_FILE, []);
}

export function saveGuardianIssues(issues: GuardianIssue[]): void {
  writeJson(GUARDIAN_ISSUES_FILE, issues.slice(0, 200));
}

export function getGuardianRepairs(): GuardianRepair[] {
  return readJson<GuardianRepair[]>(GUARDIAN_REPAIRS_FILE, []);
}

export function saveGuardianRepairs(repairs: GuardianRepair[]): void {
  writeJson(GUARDIAN_REPAIRS_FILE, repairs.slice(0, 200));
}

export function getGuardianScanHistory(): GuardianScanResult[] {
  return readJson<GuardianScanResult[]>(GUARDIAN_SCANS_FILE, []);
}

export function saveGuardianScan(scan: GuardianScanResult): void {
  const existing = getGuardianScanHistory();
  existing.unshift(scan);
  writeJson(GUARDIAN_SCANS_FILE, existing.slice(0, 30));
}

// ============================================================================
// SECURITY: SSRF DEFENSE & SAFE URL VALIDATION
// ============================================================================

export function isSafeUrlForScan(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();

    // Reject loopback, link-local, and private cloud metadata IP spaces
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "0.0.0.0" ||
      host === "169.254.169.254" || // AWS / GCP metadata
      host.endsWith(".internal") ||
      host.endsWith(".local") ||
      host.startsWith("10.") ||
      host.startsWith("192.168.")
    ) {
      return false;
    }

    // Reject 172.16.0.0 - 172.31.255.255
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) {
      return false;
    }

    return true;
  } catch (_) {
    return false;
  }
}

// ============================================================================
// SCANNER 1: CORE PAGES & API ENDPOINTS
// ============================================================================

interface EndpointScanTarget {
  name: string;
  path: string;
  section: string;
  critical: boolean;
}

const ENDPOINT_TARGETS: EndpointScanTarget[] = [
  { name: "Homepage Portal", path: "/", section: "Core Infrastructure", critical: true },
  { name: "Government Jobs Directory", path: "/jobs", section: "Government Jobs", critical: true },
  { name: "IT & Tech Careers Directory", path: "/jobs/it", section: "IT Jobs", critical: true },
  { name: "University Question Papers", path: "/university", section: "University Papers", critical: true },
  { name: "School Learning Portal", path: "/school", section: "School Learning", critical: true },
  { name: "AI Career Tools", path: "/ai-tools", section: "AI Tools", critical: false },
  { name: "Global Search Engine", path: "/search", section: "Search", critical: false },
  { name: "Results Gateway", path: "/results", section: "Results", critical: false },
  { name: "Admit Cards Retrieval", path: "/hall-tickets", section: "Admit Cards", critical: false },
  { name: "Official Portals Directory", path: "/official-websites", section: "Government Registry", critical: false },
  { name: "Jobs API Feed", path: "/api/jobs?limit=4", section: "Government Jobs API", critical: true },
  { name: "IT Jobs API Feed", path: "/api/it-jobs", section: "IT Jobs API", critical: true },
  { name: "University Papers API", path: "/api/university-papers", section: "University API", critical: true },
  { name: "School Chapters API", path: "/api/school/chapters", section: "School API", critical: true },
  { name: "Telegram Webhook Endpoint", path: "/api/telegram/webhook", section: "Telegram AI Guardian", critical: true }
];

export async function scanWebsiteEndpoints(baseUrl?: string): Promise<{
  scannedCount: number;
  issues: GuardianIssue[];
}> {
  const root = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://examhub-india.vercel.app";
  const issues: GuardianIssue[] = [];

  for (const target of ENDPOINT_TARGETS) {
    const url = `${root}${target.path}`;
    const startTime = Date.now();
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": "ExamHub-AI-Website-Guardian/3.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(6000)
      });
      const latencyMs = Date.now() - startTime;

      if (res.status === 200 || (target.path.startsWith("/api/admin/") && res.status === 401)) {
        // Service healthy
        const previousFailure = serviceFailureTracker.get(target.name);
        if (previousFailure) {
          serviceFailureTracker.delete(target.name);
          // Trigger recovery notification
          await notifyServiceRecovered(target.name, target.section, latencyMs);
        }
      } else if (res.status >= 500) {
        const failureData = serviceFailureTracker.get(target.name) || { failedAt: new Date().toISOString(), consecutiveFailures: 0 };
        failureData.consecutiveFailures++;
        serviceFailureTracker.set(target.name, failureData);

        issues.push({
          id: `iss-endpoint-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: target.critical ? "DOWNTIME" : "HTTP_ERROR",
          severity: target.critical ? "CRITICAL" : "HIGH",
          section: target.section,
          targetUrl: target.path,
          title: `${target.name} Returned HTTP ${res.status}`,
          description: `Server responded with status code ${res.status} after ${latencyMs}ms on ${target.path}.`,
          aiRecommendation: "Inspect serverless execution logs on Vercel to check for runtime unhandled exceptions or database connection pool exhaustion.",
          status: "DETECTED",
          detectedAt: new Date().toISOString(),
          attemptsCount: failureData.consecutiveFailures
        });
      } else if (res.status === 404) {
        issues.push({
          id: `iss-404-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: "HTTP_ERROR",
          severity: "HIGH",
          section: target.section,
          targetUrl: target.path,
          title: `${target.name} Route Not Found (404)`,
          description: `Public route ${target.path} returned HTTP 404 Not Found.`,
          aiRecommendation: "Verify page.tsx route existence in Next.js app directory and review rewrite definitions in next.config.mjs.",
          status: "DETECTED",
          detectedAt: new Date().toISOString(),
          attemptsCount: 1
        });
      }
    } catch (err: any) {
      const failureData = serviceFailureTracker.get(target.name) || { failedAt: new Date().toISOString(), consecutiveFailures: 0 };
      failureData.consecutiveFailures++;
      serviceFailureTracker.set(target.name, failureData);

      issues.push({
        id: `iss-down-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: target.critical ? "DOWNTIME" : "API_FAILURE",
        severity: target.critical ? "CRITICAL" : "HIGH",
        section: target.section,
        targetUrl: target.path,
        title: `${target.name} Connection Timeout / Unreachable`,
        description: `Failed to connect within 6000ms: ${err.message || "Network timeout"}`,
        aiRecommendation: "Confirm that Vercel DNS resolution is operating normally and verify cold-start latency thresholds.",
        status: "DETECTED",
        detectedAt: new Date().toISOString(),
        attemptsCount: failureData.consecutiveFailures
      });
    }
  }

  return { scannedCount: ENDPOINT_TARGETS.length, issues };
}

// ============================================================================
// SCANNER 2: JOB EXPIRY & DEADLINE GUARDIAN
// ============================================================================

export async function scanJobDeadlinesAndExpiries(): Promise<{
  jobsChecked: number;
  issues: GuardianIssue[];
  repairs: GuardianRepair[];
}> {
  const issues: GuardianIssue[] = [];
  const repairs: GuardianRepair[] = [];
  const now = Date.now();

  const allJobs: any[] = (dbStore.jobs && dbStore.jobs.length > 0) ? dbStore.jobs : initialJobs;

  for (const job of allJobs) {
    if (!job.application_end_date) continue;
    const endDateMs = new Date(job.application_end_date).getTime();

    // Check if deadline has passed but job is not marked expired
    if (endDateMs < now && !job.is_expired) {
      const issueId = `iss-expjob-${job.id}-${Date.now()}`;
      const repairId = `rep-expjob-${job.id}-${Date.now()}`;

      const issue: GuardianIssue = {
        id: issueId,
        type: "EXPIRED_JOB",
        severity: "MEDIUM",
        section: "Government Jobs",
        resourceId: job.id,
        title: `Expired Recruitment Notice: ${job.title}`,
        description: `Application deadline ended on ${new Date(job.application_end_date).toLocaleDateString("en-IN")}, but notification remained displayed as active recruitment.`,
        aiRecommendation: "Archive notification by setting is_expired: true and updating application CTA to 'Applications Closed'.",
        status: "AWAITING_APPROVAL",
        detectedAt: new Date().toISOString(),
        repairId,
        attemptsCount: 1
      };

      const repair: GuardianRepair = {
        id: repairId,
        issueId,
        actionType: "ARCHIVE_EXPIRED_JOB",
        targetResource: "jobs",
        targetIdentifier: job.id,
        originalValue: { is_expired: false, title: job.title },
        proposedValue: { is_expired: true, title: job.title },
        requiresAdminApproval: false, // Safe verified auto-repair
        status: "PROPOSED",
        createdAt: new Date().toISOString()
      };

      issues.push(issue);
      repairs.push(repair);

      // Execute safe auto-repair immediately if config allows
      const config = getGuardianConfig();
      if (config.autoRepairEnabled) {
        job.is_expired = true;
        repair.status = "EXECUTED";
        repair.appliedValue = { is_expired: true };
        repair.executedAt = new Date().toISOString();
        repair.executedBy = "AI_WEBSITE_GUARDIAN_AUTOREPAIR";
        issue.status = "REPAIRED";
        issue.resolvedAt = new Date().toISOString();
      }
    }
  }

  return { jobsChecked: allJobs.length, issues, repairs };
}

// ============================================================================
// SCANNER 3: UNIVERSITY PAPERS & SCHOOL CHAPTERS INTEGRITY
// ============================================================================

export async function scanContentIntegrity(): Promise<{
  papersChecked: number;
  schoolChaptersChecked: number;
  issues: GuardianIssue[];
}> {
  const issues: GuardianIssue[] = [];

  // 1. Audit University Question Papers
  const papers = initialUniversityQuestionPapers;
  for (const paper of papers) {
    if (!paper.pdf_url || paper.pdf_url.length < 5) {
      issues.push({
        id: `iss-univ-${paper.id}-${Date.now()}`,
        type: "MISSING_PDF",
        severity: "HIGH",
        section: "University Papers",
        resourceId: paper.id,
        title: `Missing PDF Download URL: ${paper.subject_name}`,
        description: `Question paper for ${paper.subject_code} (${paper.university_name}) does not have an active PDF download link.`,
        aiRecommendation: "Upload or configure verified archive link from university official portal repository.",
        status: "DETECTED",
        detectedAt: new Date().toISOString(),
        attemptsCount: 1
      });
    }
  }

  // 2. Audit School Chapters
  const chapters = initialSchoolChapters;
  for (const ch of chapters) {
    if (!ch.summary_notes || ch.summary_notes.trim().length < 50) {
      issues.push({
        id: `iss-school-${ch.id}-${Date.now()}`,
        type: "MISSING_NOTE",
        severity: "MEDIUM",
        section: "School Learning",
        resourceId: ch.id,
        title: `Incomplete Chapter Notes: Class ${ch.class_level} ${ch.subject} (${ch.chapter_title})`,
        description: `Chapter notes content is below minimum 50 characters threshold.`,
        aiRecommendation: "Generate comprehensive chapter summary notes with formulas and key definitions.",
        status: "DETECTED",
        detectedAt: new Date().toISOString(),
        attemptsCount: 1
      });
    }

    if (!ch.video_lessons || ch.video_lessons.length === 0) {
      issues.push({
        id: `iss-vid-${ch.id}-${Date.now()}`,
        type: "BROKEN_LINK",
        severity: "LOW",
        section: "School Learning",
        resourceId: ch.id,
        title: `No Video Classes Assigned: ${ch.chapter_title}`,
        description: `Chapter does not contain any verified YouTube video lecture IDs.`,
        aiRecommendation: "Assign educational video lesson from verified state board educational channel.",
        status: "DETECTED",
        detectedAt: new Date().toISOString(),
        attemptsCount: 1
      });
    }
  }

  return {
    papersChecked: papers.length,
    schoolChaptersChecked: chapters.length,
    issues
  };
}

// ============================================================================
// SCANNER 4: BROKEN LINKS & PDF PROBING
// ============================================================================

export async function scanBrokenLinks(limit: number = 10): Promise<{
  linksChecked: number;
  issues: GuardianIssue[];
}> {
  const issues: GuardianIssue[] = [];
  const linksToProbe: { url: string; title: string; section: string }[] = [];

  // Collect samples from official websites and jobs
  if (dbStore.jobs) {
    for (const j of dbStore.jobs.slice(0, 5)) {
      if (j.official_application_url && isSafeUrlForScan(j.official_application_url)) {
        linksToProbe.push({ url: j.official_application_url, title: `${j.title} Apply Link`, section: "Government Jobs" });
      }
    }
  }

  for (const ch of initialSchoolChapters.slice(0, 3)) {
    if (ch.pdf_notes_url && isSafeUrlForScan(ch.pdf_notes_url)) {
      linksToProbe.push({ url: ch.pdf_notes_url, title: `${ch.chapter_title} NCERT PDF`, section: "School Learning" });
    }
  }

  let checkedCount = 0;
  for (const item of linksToProbe.slice(0, limit)) {
    checkedCount++;
    try {
      const res = await fetch(item.url, {
        method: "HEAD",
        headers: { "User-Agent": "ExamHub-AI-Website-Guardian/3.0" },
        signal: AbortSignal.timeout(5000)
      }).catch(() => null);

      if (res && res.status >= 400 && res.status !== 403) {
        // 403 often indicates WAF/anti-bot on official gov sites, not broken
        issues.push({
          id: `iss-link-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: "BROKEN_LINK",
          severity: "HIGH",
          section: item.section,
          targetUrl: item.url,
          title: `Broken External Link: ${item.title}`,
          description: `Target link returned HTTP ${res.status} when checked.`,
          aiRecommendation: "Find and verify official replacement URL from respective commission gazette.",
          status: "DETECTED",
          detectedAt: new Date().toISOString(),
          attemptsCount: 1
        });
      }
    } catch (_) {}
  }

  return { linksChecked: checkedCount, issues };
}

// ============================================================================
// AUTOMATIC SAFE REPAIR ENGINE & ROLLBACK
// ============================================================================

export async function rollbackGuardianRepair(
  repairId: string,
  adminLabel: string = "SUPER_ADMIN"
): Promise<{ success: boolean; message: string; repair?: GuardianRepair }> {
  const repairs = getGuardianRepairs();
  const repair = repairs.find(r => r.id === repairId);

  if (!repair) {
    return { success: false, message: `Repair ID ${repairId} not found in history.` };
  }

  if (repair.status === "ROLLED_BACK") {
    return { success: false, message: "This repair was already rolled back previously." };
  }

  try {
    // 1. Rollback based on action type
    if (repair.actionType === "ARCHIVE_EXPIRED_JOB") {
      const jobId = repair.targetIdentifier;
      const job = (dbStore.jobs || []).find((j: any) => j.id === jobId || String(j.id) === String(jobId));
      if (job && repair.originalValue) {
        job.is_expired = repair.originalValue.is_expired;
      }
    }

    // 2. Update repair status
    repair.status = "ROLLED_BACK";
    repair.rolledBackAt = new Date().toISOString();
    repair.rollbackReason = `Manually rolled back by authorized admin ${adminLabel}`;
    saveGuardianRepairs(repairs);

    // 3. Update associated issue
    const issues = getGuardianIssues();
    const issue = issues.find(i => i.id === repair.issueId);
    if (issue) {
      issue.status = "DETECTED";
      issue.resolvedAt = undefined;
      saveGuardianIssues(issues);
    }

    // 4. Send Telegram audit notice
    await sendTelegramAdminAlert(
      `🔄 <b>GUARDIAN REPAIR ROLLED BACK</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Repair ID:</b> <code>${repair.id}</code>\n` +
      `<b>Action:</b> ${repair.actionType}\n` +
      `<b>Target:</b> ${repair.targetResource} #${repair.targetIdentifier}\n` +
      `<b>Authorized Admin:</b> ${adminLabel}\n` +
      `<b>Status:</b> Original values successfully restored.`,
      { parseMode: "HTML" }
    );

    return { success: true, message: `Successfully rolled back repair ${repairId}.`, repair };
  } catch (err: any) {
    return { success: false, message: `Rollback failed: ${err.message}` };
  }
}

export async function approveGuardianRepair(
  repairId: string,
  adminLabel: string
): Promise<{ success: boolean; message: string }> {
  const repairs = getGuardianRepairs();
  const repair = repairs.find(r => r.id === repairId);
  if (!repair) {
    return { success: false, message: `Repair ${repairId} not found.` };
  }

  if (repair.status === "EXECUTED") {
    return { success: true, message: "Repair is already executed." };
  }

  // Execute repair
  if (repair.actionType === "ARCHIVE_EXPIRED_JOB") {
    const job = (dbStore.jobs || []).find((j: any) => j.id === repair.targetIdentifier || String(j.id) === String(repair.targetIdentifier));
    if (job) job.is_expired = true;
  }

  repair.status = "EXECUTED";
  repair.executedAt = new Date().toISOString();
  repair.executedBy = adminLabel;
  saveGuardianRepairs(repairs);

  // Update issue
  const issues = getGuardianIssues();
  const issue = issues.find(i => i.id === repair.issueId);
  if (issue) {
    issue.status = "REPAIRED";
    issue.resolvedAt = new Date().toISOString();
    saveGuardianIssues(issues);
  }

  return { success: true, message: `Repair ${repairId} approved and executed.` };
}

export async function rejectGuardianRepair(
  repairId: string,
  adminLabel: string
): Promise<{ success: boolean; message: string }> {
  const repairs = getGuardianRepairs();
  const repair = repairs.find(r => r.id === repairId);
  if (!repair) {
    return { success: false, message: `Repair ${repairId} not found.` };
  }

  repair.status = "REJECTED";
  saveGuardianRepairs(repairs);

  const issues = getGuardianIssues();
  const issue = issues.find(i => i.id === repair.issueId);
  if (issue) {
    issue.status = "REJECTED";
    saveGuardianIssues(issues);
  }

  return { success: true, message: `Repair ${repairId} rejected.` };
}

// ============================================================================
// INTELLIGENT TELEGRAM GUARDIAN ALERTS
// ============================================================================

export async function dispatchGuardianAlert(issue: GuardianIssue): Promise<boolean> {
  const config = getGuardianConfig();
  if (!config.enabled) return false;

  // Check quiet hours
  if (config.quietHours.enabled) {
    const currentHour = new Date().getHours();
    const inQuietHours =
      config.quietHours.startHour > config.quietHours.endHour
        ? currentHour >= config.quietHours.startHour || currentHour < config.quietHours.endHour
        : currentHour >= config.quietHours.startHour && currentHour < config.quietHours.endHour;

    if (inQuietHours && issue.severity !== "CRITICAL") {
      return false; // Suppress during quiet hours unless critical
    }
  }

  // Deduplication check: Do not flood admin with identical alerts within 15 minutes
  const deduplicationKey = `${issue.type}_${issue.section}_${issue.targetUrl || issue.resourceId || issue.title}`;
  const lastSent = alertDeduplicationMap.get(deduplicationKey) || 0;
  if (Date.now() - lastSent < DEDUPLICATION_WINDOW_MS) {
    return false; // Suppressed by deduplication cooldown
  }
  alertDeduplicationMap.set(deduplicationKey, Date.now());

  // Severity filter: Only send immediate Telegram messages for CRITICAL or HIGH
  if (issue.severity === "LOW" && config.alertSeverityThreshold !== "LOW") {
    return false;
  }

  const detectedTimeStr = new Date(issue.detectedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const messageText = `🛡️ <b>EXAMHUB AI WEBSITE GUARDIAN</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Status:</b> ATTENTION REQUIRED\n` +
    `<b>Problem:</b> ${issue.title}\n` +
    `<b>Section:</b> ${issue.section}\n` +
    `<b>Detected:</b> ${detectedTimeStr}\n` +
    `<b>Severity:</b> ${issue.severity}\n` +
    `<b>AI Recommendation:</b> ${issue.aiRecommendation}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Authorized Admin: ${TELEGRAM_ADMIN_USERNAME} (${TELEGRAM_DEFAULT_ADMIN_CHAT_ID})</i>`;

  // Attach interactive inline buttons if repair is available
  const replyMarkup: any = {
    inline_keyboard: []
  };

  if (issue.repairId) {
    replyMarkup.inline_keyboard.push([
      { text: "🟢 Approve Repair", callback_data: `gappr_${issue.repairId}` },
      { text: "🔴 Reject Repair", callback_data: `grejc_${issue.repairId}` }
    ]);
  }

  replyMarkup.inline_keyboard.push([
    { text: "🔍 View in Guardian Cockpit", url: "https://examhub-india.vercel.app/admin/guardian" }
  ]);

  try {
    const res = await sendTelegramAdminAlert(messageText, {
      parseMode: "HTML",
      replyMarkup
    });
    return res.success;
  } catch (_) {
    return false;
  }
}

async function notifyServiceRecovered(
  serviceName: string,
  section: string,
  latencyMs: number
): Promise<void> {
  const recoveredTimeStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const msg = `✅ <b>EXAMHUB AI WEBSITE GUARDIAN — SERVICE RECOVERED</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `<b>Service:</b> ${serviceName}\n` +
    `<b>Section:</b> ${section}\n` +
    `<b>Status:</b> HEALTHY (200 OK)\n` +
    `<b>Response Latency:</b> ${latencyMs}ms\n` +
    `<b>Recovery Verified At:</b> ${recoveredTimeStr}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `All automated recovery verifications confirmed normal operations.`;

  try {
    await sendTelegramAdminAlert(msg, { parseMode: "HTML" });
  } catch (_) {}
}

// ============================================================================
// MAIN GUARDIAN ORCHESTRATOR
// ============================================================================

export async function runGuardianScan(
  scanType: "FULL" | "LINKS" | "CONTENT" | "JOB_EXPIRY" = "FULL",
  baseUrl?: string
): Promise<GuardianScanResult> {
  const scanId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  let endpointsScanned = 0;
  let linksChecked = 0;
  let jobsChecked = 0;
  let papersChecked = 0;
  let schoolChaptersChecked = 0;
  let allIssues: GuardianIssue[] = [];
  let allRepairs: GuardianRepair[] = [];

  try {
    // 1. Scan Endpoints
    if (scanType === "FULL") {
      const epRes = await scanWebsiteEndpoints(baseUrl);
      endpointsScanned = epRes.scannedCount;
      allIssues.push(...epRes.issues);
    }

    // 2. Scan Job Expiries
    if (scanType === "FULL" || scanType === "JOB_EXPIRY") {
      const jobRes = await scanJobDeadlinesAndExpiries();
      jobsChecked = jobRes.jobsChecked;
      allIssues.push(...jobRes.issues);
      allRepairs.push(...jobRes.repairs);
    }

    // 3. Scan Content
    if (scanType === "FULL" || scanType === "CONTENT") {
      const contentRes = await scanContentIntegrity();
      papersChecked = contentRes.papersChecked;
      schoolChaptersChecked = contentRes.schoolChaptersChecked;
      allIssues.push(...contentRes.issues);
    }

    // 4. Scan Links
    if (scanType === "FULL" || scanType === "LINKS") {
      const linksRes = await scanBrokenLinks(6);
      linksChecked = linksRes.linksChecked;
      allIssues.push(...linksRes.issues);
    }

    // Calculate Health Score (100 base, deductions for active issues)
    let score = 100;
    for (const iss of allIssues) {
      if (iss.severity === "CRITICAL") score -= 25;
      else if (iss.severity === "HIGH") score -= 10;
      else if (iss.severity === "MEDIUM") score -= 4;
      else score -= 1;
    }
    const healthScore = Math.max(score, 0);

    // Save issues and repairs
    const existingIssues = getGuardianIssues();
    const combinedIssues = [...allIssues, ...existingIssues.filter(e => !allIssues.some(a => a.id === e.id))];
    saveGuardianIssues(combinedIssues);

    const existingRepairs = getGuardianRepairs();
    const combinedRepairs = [...allRepairs, ...existingRepairs.filter(e => !allRepairs.some(a => a.id === e.id))];
    saveGuardianRepairs(combinedRepairs);

    // Dispatch Telegram alerts for detected issues
    for (const iss of allIssues) {
      if (iss.status === "DETECTED" || iss.status === "AWAITING_APPROVAL") {
        await dispatchGuardianAlert(iss);
      }
    }

    // Update config stats
    updateGuardianConfig({
      lastScanAt: new Date().toISOString(),
      lastHealthScore: healthScore
    });

    const result: GuardianScanResult = {
      scanId,
      scanType,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      status: "COMPLETED",
      endpointsScanned,
      linksChecked,
      jobsChecked,
      papersChecked,
      schoolChaptersChecked,
      issuesFound: allIssues.length,
      repairsTriggered: allRepairs.length,
      healthScore,
      issues: allIssues
    };

    saveGuardianScan(result);
    return result;
  } catch (err: any) {
    const failedResult: GuardianScanResult = {
      scanId,
      scanType,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      status: "FAILED",
      endpointsScanned,
      linksChecked,
      jobsChecked,
      papersChecked,
      schoolChaptersChecked,
      issuesFound: allIssues.length,
      repairsTriggered: allRepairs.length,
      healthScore: 50,
      issues: allIssues
    };
    saveGuardianScan(failedResult);
    return failedResult;
  }
}
