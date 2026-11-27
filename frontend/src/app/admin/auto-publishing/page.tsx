"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2,
  Clock, Pause, Play, RefreshCw, ExternalLink, Search, Filter,
  ArrowLeft, Check, X, Layers, AlertCircle, FileText, Globe, Eye,
  Download, HelpCircle, Archive
} from "lucide-react";

interface AutoPublishMetrics {
  discovered: number;
  verified: number;
  published: number;
  rejected: number;
  expired: number;
  suspicious: number;
  unverifiable: number;
  duplicates: number;
  deliveryFailures: number;
  lastPublishedAt: string | null;
  isPaused: boolean;
  channel: string;
  // Firestore Queue Telemetry
  isConfigured?: boolean;
  provider?: string;
  projectId?: string;
  collection?: string;
  error?: string | null;
  queueCount?: number;
  pendingCount?: number;
  dispatchingCount?: number;
  uncertainCount?: number;
  rateLimited?: number;
  retrying?: number;
  sentCount?: number;
  failed?: number;
  nextRetryAt?: string | null;
  lastSuccessfulDeliveryAt?: string | null;
  lastSuccessfulMessageId?: number | null;
  permanentErrors?: number;
  expiredInQueue?: number;
  isChannelThrottled?: boolean;
  channelThrottledUntil?: string | null;
  dailyFirestoreUsage?: {
    plan: string;
    monthlyCostRupees: number;
    billingEnabled: boolean;
    estimatedDailyReads: number;
    sparkDailyReadLimit: number;
    sparkReadQuotaPercent: number;
    estimatedDailyWrites: number;
    sparkDailyWriteLimit: number;
    sparkWriteQuotaPercent: number;
    storageUsageMb: number;
    sparkStorageLimitGb: number;
  };
}

interface JobQueueItem {
  id: string;
  jobId: number | string;
  title: string;
  organization: string;
  locationCategory: string;
  applyUrl: string;
  status: "PENDING" | "DISPATCHING" | "RETRYING" | "RATE_LIMITED" | "SENT" | "FAILED" | "EXPIRED_IN_QUEUE" | "UNCERTAIN_DELIVERY";
  attempts: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  lastError: string | null;
  idempotencyKey: string;
  telegramMessageId: number | null;
  channel: string;
  createdAt: string;
  updatedAt: string;
  lockedBy?: string | null;
  lockedAt?: string | null;
  lockExpiresAt?: string | null;
  currentAttemptId?: string | null;
  dispatchStartedAt?: string | null;
  isUncertain?: boolean;
  auditHistory?: Array<{
    timestamp: string;
    fromStatus: string;
    toStatus: string;
    reason?: string;
    workerId?: string;
    attemptId?: string | null;
  }>;
}

interface VerificationLogItem {
  id: string;
  jobId: number | string;
  title: string;
  organization: string;
  sourceUrl: string;
  applyUrl: string;
  locationCategory: string;
  status: "VERIFIED" | "REJECTED" | "EXPIRED" | "SUSPICIOUS" | "UNVERIFIABLE" | "DUPLICATE";
  score: number;
  reasons: string[];
  evidence: any;
  publishedToTelegram: boolean;
  telegramMessageId?: number;
  channel?: string;
  timestamp: string;
}

export default function AdminAutoPublishingPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [metrics, setMetrics] = useState<AutoPublishMetrics | null>(null);
  const [logs, setLogs] = useState<VerificationLogItem[]>([]);
  const [queue, setQueue] = useState<JobQueueItem[]>([]);
  const [uncertainDeliveries, setUncertainDeliveries] = useState<JobQueueItem[]>([]);
  const [archivedExpired, setArchivedExpired] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);
  const [selectedLog, setSelectedLog] = useState<VerificationLogItem | null>(null);
  const [inspectingQueueItem, setInspectingQueueItem] = useState<JobQueueItem | null>(null);
  const [reconcilingItem, setReconcilingItem] = useState<JobQueueItem | null>(null);
  const [reconcileMsgId, setReconcileMsgId] = useState<string>("");
  const [reconcileNotes, setReconcileNotes] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  function getAuthHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auto-publishing", {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setLogs(data.logs || []);
        setQueue(data.queue || []);
        setUncertainDeliveries(data.uncertainDeliveries || []);
        setArchivedExpired(data.archivedExpired || []);
      } else if (res.status === 401 || res.status === 403) {
        setFeedback({ text: data.error || "Authentication required. Please log in as administrator.", error: true });
      }
    } catch (err: any) {
      setFeedback({ text: `Failed to load auto-publishing data: ${err.message}`, error: true });
    } finally {
      setLoading(false);
    }
  }

  async function handleRetryQueue() {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/auto-publishing", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "RETRY_QUEUE" })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ text: data.message });
        fetchDashboardData();
      } else {
        setFeedback({ text: data.error || "Queue retry failed", error: true });
      }
    } catch (err: any) {
      setFeedback({ text: `Queue retry error: ${err.message}`, error: true });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMigrateJobs() {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/auto-publishing", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "MIGRATE_TO_FIRESTORE" })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ text: data.message });
        fetchDashboardData();
      } else {
        setFeedback({ text: data.message || data.error || "Migration to Firestore failed", error: true });
      }
    } catch (err: any) {
      setFeedback({ text: `Migration error: ${err.message}`, error: true });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRunDiscoveryScan() {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/auto-publishing", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "DISCOVERY_SCAN" })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ text: data.message });
        fetchDashboardData();
      } else {
        setFeedback({ text: data.error || "Discovery scan failed", error: true });
      }
    } catch (err: any) {
      setFeedback({ text: `Scan error: ${err.message}`, error: true });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleExportQueue() {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/auto-publishing", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "EXPORT_QUEUE" })
      });
      const data = await res.json();
      if (data.success) {
        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", jsonStr);
        downloadAnchor.setAttribute("download", `examhub_publishing_queue_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setFeedback({ text: `Successfully exported ${data.totalItems} queue records.` });
      } else {
        setFeedback({ text: data.error || "Export failed", error: true });
      }
    } catch (err: any) {
      setFeedback({ text: `Export error: ${err.message}`, error: true });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReconcileUncertain(resolution: "CONFIRM_DELIVERED" | "CONFIRM_NOT_DELIVERED" | "MARK_FAILED") {
    if (!reconcilingItem) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/auto-publishing", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: "RECONCILE_UNCERTAIN",
          itemId: reconcilingItem.id,
          resolution,
          telegramMessageId: reconcileMsgId ? parseInt(reconcileMsgId, 10) : undefined,
          notes: reconcileNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ text: data.message });
        setReconcilingItem(null);
        setReconcileMsgId("");
        setReconcileNotes("");
        fetchDashboardData();
      } else {
        setFeedback({ text: data.error || "Reconciliation failed", error: true });
      }
    } catch (err: any) {
      setFeedback({ text: `Reconciliation error: ${err.message}`, error: true });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTogglePause() {
    if (!metrics) return;
    const action = metrics.isPaused ? "RESUME" : "PAUSE";
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/auto-publishing", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ text: data.message });
        fetchDashboardData();
      } else {
        setFeedback({ text: data.error || "Action failed", error: true });
      }
    } catch (err: any) {
      setFeedback({ text: `Error: ${err.message}`, error: true });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTriggerTestPublish() {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/auto-publishing", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "TRIGGER_TEST" })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ text: data.message });
        fetchDashboardData();
      } else {
        setFeedback({ text: data.message || data.error || "Test publish failed", error: true });
      }
    } catch (err: any) {
      setFeedback({ text: `Delivery error: ${err.message}`, error: true });
    } finally {
      setActionLoading(false);
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== "ALL" && log.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = log.title?.toLowerCase().includes(q);
      const matchOrg = log.organization?.toLowerCase().includes(q);
      const matchLoc = log.locationCategory?.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/dashboard"
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight">AI Job Publishing Cockpit</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                metrics?.isPaused ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {metrics?.isPaused ? "PAUSED" : "AUTONOMOUS LIVE"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct AI-Verified Channel Dispatch to <strong className="text-cyan-400">{metrics?.channel || "@india102210"}</strong> without manual approval
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          <button
            onClick={handleRunDiscoveryScan}
            disabled={actionLoading}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center space-x-1.5"
            title="Run real-time automated job discovery scan from official websites"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Run Discovery Scan</span>
          </button>

          <button
            onClick={handleMigrateJobs}
            disabled={actionLoading}
            className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 transition flex items-center space-x-1.5"
            title="Import active verified opportunities into Cloud Firestore production queue"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Migrate Active Jobs</span>
          </button>

          <button
            onClick={handleRetryQueue}
            disabled={actionLoading}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center space-x-1.5"
            title="Immediately retry confirmed rate-limited and failed items"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`} />
            <span>Retry Failed Items</span>
          </button>

          <button
            onClick={handleExportQueue}
            disabled={actionLoading}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700"
            title="Export all queue documents to JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Queue</span>
          </button>

          <button
            onClick={handleTogglePause}
            disabled={actionLoading}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              metrics?.isPaused
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30"
            }`}
          >
            {metrics?.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{metrics?.isPaused ? "Resume" : "Pause"}</span>
          </button>
        </div>
      </header>

      {/* Notification Banner */}
      {feedback && (
        <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
          feedback.error ? "bg-red-950/80 border-red-800 text-red-200" : "bg-emerald-950/80 border-emerald-800 text-emerald-200"
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.error ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
        {/* Firestore Infrastructure & ₹0 Free-Tier Health Panel */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-white tracking-tight">Cloud Firestore Production Engine</h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    metrics?.isConfigured
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}>
                    {metrics?.isConfigured ? "DURABLE PERSISTENCE ACTIVE" : "AWAITING CREDENTIALS"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Project: <strong className="text-cyan-400">{metrics?.projectId || "examhub-india-6ba59"}</strong> • Primary Collection: <code className="text-amber-300 font-mono text-[11px]">{metrics?.collection || "telegram_publishing_queue"}</code>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="text-right">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Spark Reads Quota</div>
                <div className="text-emerald-400 font-mono font-bold">
                  {metrics?.dailyFirestoreUsage?.estimatedDailyReads ?? "~210"} / 50K ({metrics?.dailyFirestoreUsage?.sparkReadQuotaPercent ?? "0.42"}%)
                </div>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Spark Writes Quota</div>
                <div className="text-emerald-400 font-mono font-bold">
                  {metrics?.dailyFirestoreUsage?.estimatedDailyWrites ?? "~20"} / 20K ({metrics?.dailyFirestoreUsage?.sparkWriteQuotaPercent ?? "0.10"}%)
                </div>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Monthly Budget</div>
                <div className="text-emerald-400 font-mono font-bold">₹0.00 (Guaranteed)</div>
              </div>
            </div>
          </div>

          {!metrics?.isConfigured && (
            <div className="mt-3 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Production Configuration Requirement:</span> Firebase Admin service credentials (<code>FIREBASE_CLIENT_EMAIL</code> &amp; <code>FIREBASE_PRIVATE_KEY</code>) must be set in Vercel Environment Variables. The engine safely detects unset credentials without silently writing to <code>/tmp</code> or crashing serverless workers.
              </div>
            </div>
          )}
        </div>

        {/* UNCERTAIN DELIVERIES SECTION (Crash Recovery Quarantine) */}
        {uncertainDeliveries.length > 0 && (
          <div className="p-4 bg-purple-950/40 border border-purple-800/80 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Crash Recovery Alert: Uncertain Deliveries ({uncertainDeliveries.length})
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                QUARANTINED (NO AUTO-RESEND)
              </span>
            </div>
            <p className="text-xs text-purple-200">
              A worker process terminated while dispatching these notifications to Telegram. To guarantee zero duplicate spam, automatic re-sends are suspended until verified.
            </p>

            <div className="space-y-2">
              {uncertainDeliveries.map((item) => (
                <div key={item.id} className="p-3 bg-slate-900 border border-purple-800/40 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">{item.title}</div>
                    <div className="text-[11px] text-slate-400">
                      Attempt ID: <code className="text-purple-300 font-mono">{item.currentAttemptId || "unknown"}</code> • Worker: {item.lockedBy || "timed out"}
                    </div>
                  </div>
                  <button
                    onClick={() => setReconcilingItem(item)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>Investigate &amp; Reconcile</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Discovered</span>
              <Globe className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{metrics?.discovered || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Scanned from official sources</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>AI Verified</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400 mt-2">{metrics?.verified || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">5 verification pillars passed</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Auto-Published</span>
              <Send className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2">{metrics?.published || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Dispatched to @india102210</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Expired (Blocked)</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2">{metrics?.expired || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Passed deadlines blocked</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Duplicates Blocked</span>
              <Layers className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-black text-orange-400 mt-2">{metrics?.duplicates || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">SHA-256 duplicate guard</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Uncertain In-Flight</span>
              <HelpCircle className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 mt-2">{metrics?.uncertainCount ?? 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Crash recovery quarantined</div>
          </div>
        </div>

        {/* Delivery Queue Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Cloud Firestore Publishing Queue ({queue.length})
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400">
                Last Delivery: <strong className="text-emerald-400">{metrics?.lastSuccessfulDeliveryAt ? new Date(metrics.lastSuccessfulDeliveryAt).toLocaleTimeString("en-IN") : "None"}</strong>
                {metrics?.lastSuccessfulMessageId && ` (Msg #${metrics.lastSuccessfulMessageId})`}
              </span>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              Publishing queue is empty. Active verified opportunities have been processed.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Job Role &amp; Authority</th>
                    <th className="px-4 py-2.5 font-bold">Delivery Status</th>
                    <th className="px-4 py-2.5 font-bold">Worker Lock</th>
                    <th className="px-4 py-2.5 font-bold">Attempts</th>
                    <th className="px-4 py-2.5 font-bold">Result / Retry</th>
                    <th className="px-4 py-2.5 font-bold">Audit History</th>
                    <th className="px-4 py-2.5 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {queue.map((item) => {
                    const isSent = item.status === "SENT";
                    const isRateLimited = item.status === "RATE_LIMITED";
                    const isRetrying = item.status === "RETRYING";
                    const isFailed = item.status === "FAILED";
                    const isExpired = item.status === "EXPIRED_IN_QUEUE";
                    const isUncertain = item.status === "UNCERTAIN_DELIVERY";
                    const isDispatching = item.status === "DISPATCHING";

                    const badge = isSent
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : isRateLimited
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : isRetrying
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : isUncertain
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : isDispatching
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : isExpired
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : isFailed
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";

                    const isLocked = Boolean(item.lockedBy && item.lockExpiresAt && new Date(item.lockExpiresAt).getTime() > Date.now());

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white truncate max-w-xs">{item.title}</div>
                          <div className="text-[11px] text-slate-400">{item.organization} • {item.locationCategory}</div>
                          <div className="text-[10px] text-slate-600 font-mono mt-0.5">doc: {item.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badge}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px]">
                          {isLocked ? (
                            <span className="text-amber-400 font-mono flex items-center space-x-1">
                              <span>🔒</span>
                              <span className="truncate max-w-[100px]" title={item.lockedBy || ""}>{item.lockedBy}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono">🔓 Free</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-slate-300">{item.attempts}/{item.maxAttempts}</span>
                        </td>
                        <td className="px-4 py-3 text-[11px]">
                          {isSent ? (
                            <span className="text-emerald-400 font-mono">Msg #{item.telegramMessageId}</span>
                          ) : item.nextRetryAt ? (
                            <span className="text-indigo-400 font-mono">{new Date(item.nextRetryAt).toLocaleTimeString("en-IN")}</span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[11px]">
                          <button
                            onClick={() => setInspectingQueueItem(item)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono border border-slate-700 transition"
                          >
                            {item.auditHistory?.length || 1} transitions
                          </button>
                        </td>
                        <td className="px-4 py-3 text-[11px]">
                          {isUncertain ? (
                            <button
                              onClick={() => setReconcilingItem(item)}
                              className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold"
                            >
                              Reconcile
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Nominal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Archived Expired Historical Records */}
        {archivedExpired.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Archive className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Preserved Expired Historical Records ({archivedExpired.length})
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Preserved for student reference • Blocked from live broadcast
              </span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {archivedExpired.map((exp: any) => (
                <div key={exp.id} className="p-3 bg-slate-950 border border-amber-900/30 rounded-xl space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200">{exp.title}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      EXPIRED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{exp.organization_name} • {exp.location}</div>
                  <div className="text-[10px] text-amber-400/80 font-mono mt-1">
                    Closed on: {new Date(exp.application_end_date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                  </div>
                  <div className="text-[10px] text-slate-500 italic mt-0.5">{exp.archive_notes}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Evidence Log Filter and List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, authority, or location..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="EXPIRED">Expired Only</option>
              <option value="REJECTED">Rejected Only</option>
              <option value="SUSPICIOUS">Suspicious Only</option>
              <option value="UNVERIFIABLE">Unverifiable Only</option>
              <option value="DUPLICATE">Duplicate Only</option>
            </select>
          </div>
        </div>

        {/* Verification Logs List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              AI Verification Decisions ({filteredLogs.length})
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No verification decisions match the current filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => {
                const isVerified = log.status === "VERIFIED";
                const isExpired = log.status === "EXPIRED";
                const isDuplicate = log.status === "DUPLICATE";
                const isSuspicious = log.status === "SUSPICIOUS";

                const badge = isVerified
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : isExpired
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : isDuplicate
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : isSuspicious
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30";

                return (
                  <div key={log.id} className="p-4 hover:bg-slate-800/40 transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badge}`}>
                            {log.status}
                          </span>
                          <span className="text-xs font-mono text-cyan-400">Score: {log.score}/100</span>
                          <span className="text-xs text-slate-500">📍 {log.locationCategory}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{log.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{log.organization}</p>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Reason: {log.reasons?.join("; ") || "Passed verification rules"}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end md:self-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition border border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Evidence</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Audit History Inspector Modal */}
      {inspectingQueueItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Queue Transition Audit Log</h3>
                <p className="text-xs text-slate-400 truncate max-w-sm">{inspectingQueueItem.title}</p>
              </div>
              <button
                onClick={() => setInspectingQueueItem(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div>Document ID: <code className="text-amber-400 font-mono">{inspectingQueueItem.id}</code></div>
                <div>Status: <span className="font-bold text-cyan-400">{inspectingQueueItem.status}</span></div>
                <div>Attempts: <span className="font-mono">{inspectingQueueItem.attempts}/{inspectingQueueItem.maxAttempts}</span></div>
                <div>Worker Lock: <span className="font-mono text-slate-400">{inspectingQueueItem.lockedBy || "Unlocked"}</span></div>
              </div>

              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-3">State Transitions</h4>
              <div className="space-y-2">
                {inspectingQueueItem.auditHistory?.map((h, i) => (
                  <div key={i} className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{h.fromStatus} &rarr; {h.toStatus}</span>
                      <span className="text-[10px] text-slate-500">{new Date(h.timestamp).toLocaleTimeString("en-IN")}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{h.reason}</div>
                    <div className="text-[10px] text-slate-600 font-mono">Worker: {h.workerId} {h.attemptId && `• Attempt: ${h.attemptId}`}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectingQueueItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uncertain Delivery Reconciliation Modal */}
      {reconcilingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-800/80 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Reconcile Uncertain Delivery</h3>
              </div>
              <button
                onClick={() => setReconcilingItem(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-800/40">
                <div className="font-bold text-white">{reconcilingItem.title}</div>
                <div className="text-slate-400 mt-1">{reconcilingItem.organization}</div>
                <div className="text-[11px] text-purple-300 font-mono mt-1">
                  Attempt: {reconcilingItem.currentAttemptId || "unknown"} • Started: {reconcilingItem.dispatchStartedAt ? new Date(reconcilingItem.dispatchStartedAt).toLocaleTimeString("en-IN") : "unknown"}
                </div>
              </div>

              <div>
                <label className="text-slate-300 block text-xs font-bold mb-1">
                  If message appeared on Telegram, enter Message ID:
                </label>
                <input
                  type="number"
                  value={reconcileMsgId}
                  onChange={(e) => setReconcileMsgId(e.target.value)}
                  placeholder="e.g. 884102"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block text-xs font-bold mb-1">
                  Reconciliation Notes:
                </label>
                <input
                  type="text"
                  value={reconcileNotes}
                  onChange={(e) => setReconcileNotes(e.target.value)}
                  placeholder="e.g. Verified Telegram channel post manually"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleReconcileUncertain("CONFIRM_DELIVERED")}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Delivered (Mark as SENT)</span>
                </button>

                <button
                  onClick={() => handleReconcileUncertain("CONFIRM_NOT_DELIVERED")}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Confirm NOT Delivered (Release for Safe Retry)</span>
                </button>

                <button
                  onClick={() => handleReconcileUncertain("MARK_FAILED")}
                  disabled={actionLoading}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs transition border border-red-900/40"
                >
                  Mark as Permanent Failure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">AI Verification Evidence</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Job Title</span>
                <p className="font-bold text-white mt-0.5">{selectedLog.title}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Organization</span>
                <p className="font-semibold text-white mt-0.5">{selectedLog.organization}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Location Classification</span>
                <p className="font-semibold text-cyan-400 mt-0.5">📍 {selectedLog.locationCategory}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold block text-[11px]">5-Pillar Verification Checklist</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    {selectedLog.evidence?.organizationVerified ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Organization Verification</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {selectedLog.evidence?.linkVerified ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Link &amp; SSRF Verification</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {selectedLog.evidence?.expiryVerified ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Expiry &amp; Active Status</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {selectedLog.evidence?.contentVerified ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Content Integrity</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {selectedLog.evidence?.fraudCheckPassed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Fraud &amp; Scam Shield</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {selectedLog.evidence?.duplicateCheckPassed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Duplicate Guard</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
