"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2,
  Clock, Pause, Play, RefreshCw, ExternalLink, Search, Filter,
  ArrowLeft, Check, X, Layers, AlertCircle, FileText, Globe, Eye
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
  queueCount?: number;
  rateLimited?: number;
  retrying?: number;
  failed?: number;
  nextRetryAt?: string | null;
  lastSuccessfulDeliveryAt?: string | null;
  lastSuccessfulMessageId?: number | null;
  permanentErrors?: number;
  expiredInQueue?: number;
}

interface JobQueueItem {
  id: string;
  jobId: number | string;
  title: string;
  organization: string;
  locationCategory: string;
  applyUrl: string;
  status: "PENDING" | "RETRYING" | "RATE_LIMITED" | "SENT" | "FAILED" | "EXPIRED_IN_QUEUE";
  attempts: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  lastError: string | null;
  idempotencyKey: string;
  telegramMessageId: number | null;
  channel: string;
  createdAt: string;
  updatedAt: string;
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
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);
  const [selectedLog, setSelectedLog] = useState<VerificationLogItem | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auto-publishing");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setLogs(data.logs || []);
        setQueue(data.queue || []);
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
        headers: { "Content-Type": "application/json" },
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

  async function handleTogglePause() {
    if (!metrics) return;
    const action = metrics.isPaused ? "RESUME" : "PAUSE";
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/auto-publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
              <h1 className="text-xl font-black text-white tracking-tight">AI Job Publishing Monitor</h1>
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

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          <button
            onClick={handleRetryQueue}
            disabled={actionLoading}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
            title="Immediately retry all pending and rate-limited items in publishing queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`} />
            <span>Retry Queue Now</span>
          </button>

          <button
            onClick={handleTriggerTestPublish}
            disabled={actionLoading}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center space-x-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Channel Alert</span>
          </button>

          <button
            onClick={handleTogglePause}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              metrics?.isPaused
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30"
            }`}
          >
            {metrics?.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{metrics?.isPaused ? "Resume Publishing" : "Pause Publishing"}</span>
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
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
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
            <div className="text-[11px] text-slate-500 mt-0.5">Published to @india102210</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Rejected / Low Score</span>
              <X className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-red-400 mt-2">{metrics?.rejected || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Unrecognized authority / missing fields</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Expired Recruitment</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2">{metrics?.expired || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Application deadline passed</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Suspicious / Scam</span>
              <ShieldAlert className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 mt-2">{metrics?.suspicious || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Fee scams / shorteners / SSRF</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Unverifiable Deadline</span>
              <AlertCircle className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400 mt-2">{metrics?.unverifiable || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Missing dates or broken link</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Duplicates Blocked</span>
              <Layers className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-black text-orange-400 mt-2">{metrics?.duplicates || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">SHA-256 fingerprint duplicate</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Delivery Failures</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-2">{metrics?.deliveryFailures || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Telegram API network errors</div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Last Broadcast</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-white mt-2 truncate">
              {metrics?.lastPublishedAt ? new Date(metrics.lastPublishedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "None yet"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
              {metrics?.lastPublishedAt ? new Date(metrics.lastPublishedAt).toLocaleDateString("en-IN") : "Awaiting first"}
            </div>
          </div>

          {/* Queue Awaiting Delivery */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Queue Awaiting</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400 mt-2">{metrics?.queueCount ?? 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Awaiting channel dispatch</div>
          </div>

          {/* Rate-Limited Deliveries */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Rate-Limited</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2">{metrics?.rateLimited ?? 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">HTTP 429 backoff active</div>
          </div>

          {/* Next Scheduled Retry */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Next Retry</span>
              <RefreshCw className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-bold text-indigo-300 mt-2 truncate">
              {metrics?.nextRetryAt ? new Date(metrics.nextRetryAt).toLocaleTimeString("en-IN") : "Idle"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
              {metrics?.nextRetryAt ? new Date(metrics.nextRetryAt).toLocaleDateString("en-IN") : "No pending retries"}
            </div>
          </div>

          {/* Permanent Errors */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Permanent Errors</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-2">{metrics?.permanentErrors ?? 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">HTTP 403 or max retries</div>
          </div>
        </div>

        {/* Delivery Queue Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Telegram Publishing Queue ({queue.length})
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
              Publishing queue is empty. All verified jobs have been processed.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Job Role & Organization</th>
                    <th className="px-4 py-2.5 font-bold">Delivery Status</th>
                    <th className="px-4 py-2.5 font-bold">Attempts</th>
                    <th className="px-4 py-2.5 font-bold">Next Retry / Result</th>
                    <th className="px-4 py-2.5 font-bold">Error / Telemetry Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {queue.map((item) => {
                    const isSent = item.status === "SENT";
                    const isRateLimited = item.status === "RATE_LIMITED";
                    const isRetrying = item.status === "RETRYING";
                    const isFailed = item.status === "FAILED";
                    const isExpired = item.status === "EXPIRED_IN_QUEUE";

                    const badge = isSent
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : isRateLimited
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : isRetrying
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : isExpired
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : isFailed
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white truncate max-w-xs">{item.title}</div>
                          <div className="text-[11px] text-slate-400">{item.organization} • {item.locationCategory}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badge}`}>
                            {item.status}
                          </span>
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
                        <td className="px-4 py-3 text-[11px] text-slate-400 max-w-sm truncate">
                          {item.lastError || "Awaiting dispatch window"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, organization, or location category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="ALL">All Statuses ({logs.length})</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="SUSPICIOUS">SUSPICIOUS</option>
              <option value="REJECTED">REJECTED</option>
              <option value="UNVERIFIABLE">UNVERIFIABLE</option>
              <option value="DUPLICATE">DUPLICATE</option>
            </select>
          </div>
        </div>

        {/* Live Discovered Jobs Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Verification & Auto-Publishing Feed ({filteredLogs.length})
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Autonomous processing log</span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No verification records match your selected filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredLogs.map((log) => {
                const isVerified = log.status === "VERIFIED";
                const isExpired = log.status === "EXPIRED";
                const isSuspicious = log.status === "SUSPICIOUS";
                const isDuplicate = log.status === "DUPLICATE";
                const isRejected = log.status === "REJECTED";

                const badgeClass = isVerified
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : isExpired
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : isSuspicious
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : isDuplicate
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  : isRejected
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-blue-500/20 text-blue-400 border-blue-500/30";

                return (
                  <div key={log.id} className="p-4 hover:bg-slate-800/40 transition">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgeClass}`}>
                            {log.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                            📍 {log.locationCategory}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400">
                            Score: {log.score}/100
                          </span>
                          {log.publishedToTelegram && log.telegramMessageId && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                              Telegram Msg ID: {log.telegramMessageId}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white">{log.title}</h3>
                        <p className="text-xs text-slate-400 font-medium">🏢 {log.organization}</p>

                        {/* Reasons & Evidence */}
                        {log.reasons && log.reasons.length > 0 && (
                          <div className="pt-1 text-[11px] text-slate-400 space-y-0.5">
                            {log.reasons.map((r, i) => (
                              <div key={i} className="flex items-center space-x-1.5">
                                <span className={isVerified ? "text-emerald-400" : "text-amber-400"}>•</span>
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Links */}
                        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                          {log.sourceUrl && (
                            <a
                              href={log.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-cyan-400 flex items-center space-x-1 text-[11px]"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Official Source</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          )}
                          {log.applyUrl && (
                            <a
                              href={log.applyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[11px]"
                            >
                              <span>Official Apply Portal</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end text-right shrink-0 space-y-2">
                        <span className="text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white flex items-center space-x-1 transition"
                        >
                          <Eye className="w-3 h-3" />
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
                    <span>Link & SSRF Verification</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {selectedLog.evidence?.expiryVerified ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Expiry & Active Status</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {selectedLog.evidence?.contentVerified ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Content Integrity</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {selectedLog.evidence?.fraudCheckPassed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Fraud & Scam Shield</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {selectedLog.evidence?.duplicateCheckPassed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-red-400" />}
                    <span>Duplicate Guard</span>
                  </div>
                </div>
              </div>

              {selectedLog.evidence?.fingerprint && (
                <div>
                  <span className="text-slate-400 block text-[11px]">SHA-256 Content Fingerprint</span>
                  <code className="text-[10px] text-slate-300 font-mono bg-slate-950 p-2 rounded-lg block overflow-x-auto mt-0.5">
                    {selectedLog.evidence.fingerprint}
                  </code>
                </div>
              )}
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
